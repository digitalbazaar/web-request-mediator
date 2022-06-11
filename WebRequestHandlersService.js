/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {EventEmitter} from 'web-request-rpc';
import localforage from './storage.js';
import {utils} from 'web-request-rpc';

/* Web Request handlers are tracked by request type. */
export class WebRequestHandlersService extends EventEmitter {
  constructor(relyingOrigin, {requestType, permissionManager} = {}) {
    super({
      async waitUntil(e) {
        return e._promise
      }
    });

    if(!(relyingOrigin && (typeof relyingOrigin === 'string' ||
      relyingOrigin.then))) {
      throw new TypeError(
        '"relyingOrigin" must be a non-empty string or a promise that ' +
        'resolves to one.');
    }
    this._relyingOrigin = relyingOrigin;

    // manage permissions for the relying origin
    this._permissionManager = permissionManager;
  }

  /**
   * Creates a handler registration.
   *
   * @param requestType the type of request handled by the handler.
   * @param url the unique URL for the handler.
   *
   * @return a Promise that resolves to the normalized URL for the
   *           handler.
   */
  async register(requestType, url) {
    url = _normalizeUrl(url, await this._relyingOrigin);

    // return existing registration
    const existing = await this.getRegistration(requestType, url);
    if(existing) {
      return existing;
    }

    // safe to call this once `_normalizeUrl` has sanitized the url
    return WebRequestHandlersService._setRegistration(requestType, url);
  }

  /**
   * Unregisters a handler, destroying its registration.
   *
   * @param requestType the type of request handled by the handler.
   * @param url the unique URL for the handler.
   *
   * @return a Promise that resolves to `true` if the handler was registered
   *           and `false` if not.
   */
  async unregister(requestType, url) {
    const relyingOrigin = await this._relyingOrigin;
    url = _normalizeUrl(url, relyingOrigin);

    // find target registration
    const registration = await this.getRegistration(requestType, url);
    if(!registration) {
      return false;
    }

    // emit `unregister` so extensions can handle registration destruction
    const event = {
      type: 'unregister',
      requestType: requestType,
      registration: url,
      waitUntil(promise) {
        event._promise = promise;
      }
    };
    await this.emit(event);

    // remove handler
    await WebRequestHandlersService._getHandlerStorage(
      requestType, relyingOrigin).removeItem(registration);
    return true;
  }

  /**
   * Gets an existing handler registration.
   *
   * @param requestType the type of request handled by the handler.
   * @param url the URL for the handler.
   *
   * @return a Promise that resolves to the normalized URL for the
   *            handler or `null` if no such registration exists.
   */
  async getRegistration(requestType, url) {
    url = _normalizeUrl(url, await this._relyingOrigin);
    if(!await this.hasRegistration(requestType, url)) {
      return null;
    }
    return url;
  }

  /**
   * Returns `true` if the given handler has been registered and `false` if
   * not.
   *
   * @param requestType the type of request handled by the handler.
   * @param url the URL for the handler.
   *
   * @return a Promise that resolves to `true` if the registration exists and
   *           `false` if not.
   */
  async hasRegistration(requestType, url) {
    const relyingOrigin = await this._relyingOrigin;
    url = _normalizeUrl(url, relyingOrigin);
    return await WebRequestHandlersService._getHandlerStorage(
      requestType, relyingOrigin).getItem(url) === true;
  }

  /**
   * Gets origin storage. This storage is used to track all origins that
   * have registered a particular type of web request handler.
   *
   * @param requestType the request type to get the storage for.
   *
   * @return the origin storage.
   */
  static _getOriginStorage(requestType) {
    return localforage.createInstance(_getOriginStorageConfig(requestType));
  }

  /**
   * Gets the handler storage for a particular request type. This storage is
   * used to track the specific handlers (for a particular request type) that
   * have been registered by a particular origin.
   *
   * @param requestType the request type to get the storage for.
   * @param origin the origin to get the handler storage for.
   *
   * @return the handler storage.
   */
  static _getHandlerStorage(requestType, origin) {
    return localforage.createInstance(
      _getHandlerStorageConfig(requestType, origin));
  }

  /**
   * Return all handler URLs for a specific request type.
   *
   * @param requestType the request type.
   *
   * @return a Promise that resolves to all registered handler URLs for the
   *           given request type.
   */
  static async _getAllRegistrations(requestType) {
    // asynchronously get a list of promises where each will resolve to the
    // registered handler URLs for a particular origin
    const registrations = [];
    const promises = [];
    const originStorage = WebRequestHandlersService._getOriginStorage(
      requestType);
    await originStorage.iterate(databaseConfig => {
      // get origin's request handler URLs
      const storage = localforage.createInstance(databaseConfig);
      const urls = [];
      promises.push(storage.iterate((value, url) => {
        urls.push(url);
      }).then(() => {
        // append all registrations for the origin to `registrations`
        registrations.push(...urls);
      }));
    });
    await Promise.all(promises);
    return registrations;
  }

  /**
   * Sets the handler registration for the origin matching the given url to
   * the url value. This is a private method that may be called by a mediator
   * to set a registration from within the mediator.
   *
   * @param requestType the type of request handled by the handler.
   * @param url the unique URL for the handler.
   *
   * @return a Promise that resolves to the normalized URL for the
   *   handler.
   */
  static async _setRegistration(requestType, url) {
    const parsed = utils.parseUrl(url, origin);
    const handlerUrl = parsed.origin + parsed.pathname;

    // add new registration:
    // 1. Add that origin has registered for the request type.
    // 2. Add the registration url.
    const originStorage = WebRequestHandlersService._getOriginStorage(
      requestType);
    await originStorage.setItem(
      parsed.origin,
      _getHandlerStorageConfig(requestType, parsed.origin));

    const handlerStorage = WebRequestHandlersService._getHandlerStorage(
      requestType, parsed.origin);
    await handlerStorage.setItem(url, true);

    return url;
  }
}

function _normalizeUrl(url, origin) {
  const parsed = utils.parseUrl(url, origin);
  if(parsed.origin !== origin) {
    throw new Error(`Url "${url}" must have an origin of "${origin}"`);
  }
  return parsed.origin + parsed.pathname;
}

function _getOriginStorageConfig(requestType) {
  // TODO: use 'name' and 'storeName'?
  // {name: 'webRequestHandler_' + requestType, storeName: 'origin'}
  return {
    name: 'webRequestHandler_' + requestType + '_origin',
    driver: localforage.driver()
  };
}

function _getHandlerStorageConfig(requestType, origin) {
  // TODO: use 'name' and 'storeName'?
  // {
  //   name: 'webRequestHandler_' + requestType,
  //   storeName: 'registration_' + origin
  // }
  return {
    name: 'webRequestHandler_' + requestType + '_' + origin + '_registration',
    driver: localforage.driver()
  };
}

/*!
 * A SimpleContainerService provides the implementation for
 * simple container instances (those with a common CRUD interface) on a
 * particular remote origin.
 *
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import localforage from './storage.js';
import {utils} from 'web-request-rpc';

export class SimpleContainerService {
  constructor(relyingOrigin, {
    itemType,
    permissionManager,
    requiredPermission,
    validateKey = () => {throw new Error('Not implemented.')},
    validateItem = () => {throw new Error('Not implemented.')}
  }) {
    if(!(relyingOrigin && typeof relyingOrigin === 'string')) {
      throw new TypeError('"relyingOrigin" must be a non-empty string.');
    }
    if(!(itemType && typeof itemType === 'string')) {
      throw new TypeError('"itemType" must be a non-empty string.');
    }
    if(!(requiredPermission && typeof requiredPermission === 'string')) {
      throw new TypeError('"requiredPermission" must be a non-empty string.');
    }
    this._relyingOrigin = relyingOrigin;
    this._itemType = itemType;
    this._permissionManager = permissionManager;
    this._requiredPermission = requiredPermission;
    this._validateKey = validateKey;
    this._validateItem = validateItem;
  }

  async delete(url, key) {
    if(!await this.has(url, key)) {
      return false;
    }
    await this._getStorage(url).removeItem(key);
    return true;
  }

  async get(url, key) {
    await this._checkPermission();
    this._validateKey(key);
    return this._getStorage(url).getItem(key);
  }

  async keys(url) {
    await this._checkPermission();
    return this._getStorage(url).keys();
  }

  async has(url, key) {
    return await this.get(url, key) !== null;
  }

  async set(url, key, item) {
    await this._checkPermission();
    this._validateKey(key);
    this._validateItem(item);
    await this._getStorage(url).setItem(key, item);
  }

  async clear(url) {
    await this._checkPermission();
    return this._getStorage(url).clear();
  }

  /**
   * Gets the item storage API for a particular handler after a same
   * remote origin check.
   *
   * @param url the URL for the handler.
   *
   * @return the storage API.
   */
  _getStorage(url) {
    utils.isValidOrigin(url, this._relyingOrigin);
    return SimpleContainerService._getStorage(url, this._itemType);
  }

  /**
   * Checks to make sure that the remote origin has the required permission.
   */
  async _checkPermission() {
    // ensure origin has the required permission
    const permission = this._requiredPermission;
    const status = await this._permissionManager.query(
      {name: this._requiredPermission});
    if(status.state !== 'granted') {
      throw new Error('Permission denied.');
    }
  }

  /**
   * Gets the item storage API for a particular handler WITHOUT a same
   * remote origin check.
   *
   * @param url the URL for the handler.
   * @param itemType the type of item storage to get.
   *
   * @return the storage API.
   */
  static _getStorage(url, itemType) {
    return localforage.createInstance({
      name: itemType + '_' + url,
      driver: localforage.driver()
    });
  }

  /**
   * Return all "item matches" for a handler that match according to a custom
   * matching function. If the match function returns an "item match" object
   * or `false` if the item does not match. An "item match" object will be
   * added to an array that the Promise returned by this function will resolve
   * to.
   *
   * The match function will be passed:
   * {
   *   handler: <url>,
   *   key: <item key>,
   *   item: <item>
   * }
   *
   * @param url the URL that identifies the handler to check.
   * @param match({handler, key, item}) the custom matching function.
   *
   * @return a Promise that resolves to an array of "item match" objects
   *           according to the `match` function's return values.
   */
  static async _match(url, itemType, match) {
    const matches = [];
    const handler = url;
    const storage = SimpleContainerService._getStorage(url, itemType);
    await storage.iterate((item, key) => {
      const result = match({handler, key, item});
      if(result) {
        matches.push(result);
      }
    });
    return matches;
  }

  /**
   * Destroys item storage for a handler.
   *
   * @param url the URL that identifies the handler.
   * @param itemType the type of item storage.
   */
  static async _destroy(url, itemType) {
    // TODO: use _getStorage(url).dropInstance() instead (when available)
    return SimpleContainerService._getStorage(url, itemType).clear();
  }
}

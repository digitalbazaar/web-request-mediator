/*!
 * A PermissionManager for a Web Request Mediator.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import localforage from 'localforage';

const VALID_PERMISSION_STATES = ['granted', 'denied', 'prompt'];

export class PermissionManager {
  constructor(relyingOrigin, {request = deny} = {}) {
    if(!(relyingOrigin && typeof relyingOrigin === 'string')) {
      throw new TypeError('"relyingOrigin" must be a non-empty string.');
    }
    if(typeof request !== 'function') {
      throw new TypeError('"request" must be a function.');
    }

    this._request = request;
    this.permissions = localforage.createInstance({
      name: 'permission_' + relyingOrigin
    });
    // a list of supported permissions
    this.registry = [];
  }

  /**
   * Obtains the status of the given permission.
   *
   * @param permissionDesc a PermissionDescriptor containing the name of
   *          the permission to ask about (e.g. {name: 'permissionName'}).
   *
   * @return a Promise that resolves to the PermissionStatus containing
   *           the state of the permission
   *           (e.g. {state: 'granted'/'denied'/'prompt'})).
   */
  async query(permissionDesc) {
    this._validatePermissionDescriptor(permissionDesc);

    const status = await this.permissions.getItem(permissionDesc.name);
    if(status) {
      return status;
    }
    // return default permission descriptor (state of `prompt`)
    return {
      state: 'prompt'
      // TODO: support `onchange` EventHandler
    };
  }

  /**
   * Requests that the user grant a permission to the current origin.
   *
   * @param permissionDesc a PermissionDescriptor containing the name of
   *          the permission to request (e.g. {name: 'permissionName'}).
   *
   * @return a Promise that resolves to the PermissionStatus containing
   *           the new state of the permission
   *           (e.g. {state: 'granted'/'denied'})).
   */
  async request(permissionDesc) {
    // TODO: disallow more than one request at a time or pipeline them
    let status = await this.query(permissionDesc);
    if(status.state === 'prompt') {
      let storeStatus = status = await this._request(permissionDesc);
      this._validatePermissionStatus(status);
      // do not store `denied`, set to `prompt` so origin can ask later
      if(status.state === 'denied') {
        storeStatus = {state: 'prompt'};
      }
      await this.permissions.setItem(permissionDesc.name, storeStatus);
    }
    return status;
  }

  /**
   * Revokes a permission for the current origin.
   *
   * @param permissionDesc a PermissionDescriptor containing the name of
   *          the permission to revoke (e.g. {name: 'permissionName'}).
   *
   * @return a Promise that resolves to the PermissionStatus containing
   *           the new state of the permission
   *           (e.g. {state: 'granted'/'denied'/'prompt'})).
   */
  async revoke(permissionDesc) {
    this._validatePermissionDescriptor(permissionDesc);
    // set permission status back to default, which is `prompt`
    await this.permissions.setItem(permissionDesc.name, {
      state: 'prompt'
    });
    // call `query` according to spec
    return this.query(permissionDesc);
  }

  /**
   * Registers a permission.
   *
   * @param permissionName the permission name.
   */
  _registerPermission(permissionName) {
    this.registry[permissionName] = true;
  }

  /**
   * Ensures a PermissionDescriptor is valid, throwing exceptions if not.
   *
   * @param permissionDesc the PermissionDescriptor to check.
   */
  _validatePermissionDescriptor(permissionDesc) {
    if(!(permissionDesc && typeof permissionDesc === 'object')) {
      throw new TypeError('"permissionDesc" must be an object.');
    }
    // TODO: support EventHandler `onchange` too
    if(typeof permissionDesc.name !== 'string') {
      throw new TypeError('"permissionDesc.name" must be a string.');
    }
    if(!this.registry[permissionDesc.name]) {
      throw new Error(`Unknown permission "${permissionDesc.name}".`);
    }
  }

  /**
   * Ensures a PermissionStatus is valid, throwing exceptions if not.
   *
   * @param status the PermissionStatus to check.
   */
  _validatePermissionStatus(status) {
    if(!(status && typeof status === 'object')) {
      throw new TypeError('Permission "status" must be an object.');
    }
    if(!(typeof status.state === 'string' &&
      VALID_PERMISSION_STATES.includes(status.state))) {
      throw new Error(`Invalid permission state "${status.state}".`);
    }
  }
}

async function deny() {
  return {state: 'denied'};
}

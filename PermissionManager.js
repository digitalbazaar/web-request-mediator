/*!
 * A PermissionManager for a Web Request Mediator.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as localforage from 'localforage';

const VALID_PERMISSION_STATES = ['granted', 'denied', 'prompt'];

export class PermissionManager {
  constructor(origin, request) {
    if(!(origin && typeof origin === 'string')) {
      throw new TypeError('"origin" must be a non-empty string.');
    }
    if(request && typeof request !== 'function') {
      throw new TypeError('"request" must be a function.');
    }

    this.origin = origin;
    this._request = request || deny;
    this.permissions = localforage.createInstance({
      name: 'permissions'
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

    const status = await this.permissions.getItem(this._key(permissionDesc.name));
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
    this._validatePermissionDescriptor(permissionDesc);
    const status = await this._request(permissionDesc);
    this._validatePermissionStatus(status);
    await this.permissions.setItem(this._key(permissionDesc.name), status);
    return Promise.resolve(status);
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
    await this.permissions.setItem(this._key(permissionDesc.name, {
      state: 'prompt'
    }));
    // call `query` according to spec
    return this.query(permissionDesc);
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
    if(typeof permissionDesc.name === 'string') {
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

  /**
   * Generates the database key for the given permission name.
   *
   * @param permissionName the name of the permission.
   *
   * @return the database key.
   */
  _key(permissionName) {
    return JSON.stringify([this.origin, permissionName]);
  }
}

async function deny() {
  return Promise.resolve({
    state: 'denied'
  });
}

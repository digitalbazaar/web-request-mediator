/*!
 * The core WebRequestMediator class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as rpc from 'web-request-rpc';

export class WebRequestMediator {
  constructor(origin) {
    this.origin = origin;
    this.client = null;
    this.injector = null;
    this._control = null;
    this._connected = false;
    this.client = new rpc.Client();
    this.server = new rpc.Server();
  }

  /**
   * Connects this WebRequestMediator to the origin that instantiated it. Once
   * connected, the WebRequestMediator can start servicing calls from that
   * origin.
   *
   * @return a Promise that resolves to an injector for creating client APIs
   *           once the connection is ready.
   */
  async connect() {
    this.injector = await this.client.connect(this.origin);
    this._connected = true;
    this._control = this.injector.define('core.control', {
      functions: ['ready', 'show', 'hide']
    });
    this.server.listen(this.origin);
    this._control.ready();
    return this.injector;
  }

  /**
   * Closes this WebRequestMediator's connection to the relying origin.
   */
  close() {
    if(this._connected) {
      this.server.close();
      this.client.close();
      this._connected = false;
    }
  }

  /**
   * Shows the UI for this WebRequestMediator on the relying origin.
   */
  async show() {
    if(!this._connected) {
      throw new Error('Cannot "show" yet; not connected.');
    }
    return this._control.show();
  }

  /**
   * Hides the UI for this WebRequestMediator on the relying origin.
   */
  async hide() {
    if(!this._connected) {
      throw new Error('Cannot "hide" yet; not connected.');
    }
    return this._control.hide();
  }
}

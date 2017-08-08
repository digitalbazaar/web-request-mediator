/*!
 * The core WebRequestMediator class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as rpc from 'web-request-rpc';

export class WebRequestMediator extends rpc.WebApp {
  constructor(relyingOrigin) {
    super(relyingOrigin);
  }

  async connect() {
    await super.connect();
    await this.ready();
    return this.injector;
  }
}

/*!
 * The core WebRequestMediator class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {WebApp} from 'web-request-rpc';

export class WebRequestMediator extends WebApp {
  constructor(relyingOrigin) {
    super(relyingOrigin);
  }

  async connect() {
    await super.connect();
    await this.ready();
    return this.injector;
  }
}

/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import localforage from 'localforage';
import cookieDriver from './cookieDriver.js';

localforage.defineDriver(cookieDriver);

export default localforage;

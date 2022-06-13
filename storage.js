/*!
 * Copyright (c) 2018-2022 Digital Bazaar, Inc. All rights reserved.
 */
import cookieDriver from './cookieDriver.js';
import localforage from 'localforage';

localforage.defineDriver(cookieDriver);

export default localforage;

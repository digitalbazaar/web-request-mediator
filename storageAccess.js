/*!
 * New BSD License (3-clause)
 * Copyright (c) 2018-2019, Digital Bazaar, Inc.
 * All rights reserved.
 */
'use strict';

export async function hasStorageAccess() {
  try {
    if(typeof document.hasStorageAccess === 'function') {
      return await document.hasStorageAccess();
    }
    return true;
  } catch(e) {
    console.error(e);
  }
  return false;
}

export async function requestStorageAccess() {
  try {
    if(typeof document.requestStorageAccess === 'function') {
      await document.requestStorageAccess();
    }
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
}

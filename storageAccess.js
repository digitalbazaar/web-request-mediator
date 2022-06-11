/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
// FIXME: remove file; no longer used
export async function hasStorageAccess() {
  try {
    // Firefox or Safari
    if(typeof document.hasStorageAccess === 'function') {
      // Safari has no window.netscape;
      // Safari needs to check for cookie existence
      if(!window.netscape && document.cookie === '') {
        return false;
      }
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
    // Firefox or Safari
    if(typeof document.requestStorageAccess === 'function') {
      await document.requestStorageAccess();
      // Safari has no window.netscape;
      // Safari needs to check for cookie existence
      if(!window.netscape && document.cookie === '') {
        throw new Error('Storage access denied.');
      }
    }
  } catch(e) {
    if(e === undefined) {
      e = new Error('Storage access denied.');
    }
    console.error(e);
    return false;
  }
  return true;
}

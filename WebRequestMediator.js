/*!
 * The core WebRequestMediator class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as rpc from 'web-request-rpc';

//import {PermissionManager} from './PermissionManager';
//import {WebRequestMediator} from './WebRequestMediator';

export default class WebRequestMediator {

  async show() {
    // TODO: send a 'show' message to the client?
  }

  async hide() {
    // TODO: send a 'hide' message to the client?
  }
}

//export function


//export ...

/*
Requirements
Ask the user to grant permission to service provider Web applications.
Enable service provider applications to register themselves with the mediator.
Accept requests from a relying party website.
Enable developers to customize the requests that can be received and validate them.
Enable developers to create custom experiences to obtain user consent to use service provider applications to fulfill the request.
Load a third party service provider application and pass requests to it.
Enable service provider applications to load a contextual window to interact with the user when helping them fulfill the request.
Receive responses from a service provider application.
Enable developers to customize handling responses from the service provider application.
Pass responses to the relying party website.

Design
“web-mediator” module
Permission manager w/API `requestPermission` and `checkPermission` API
Service Provider Web App registry with custom registration info
Generalize as much as possible (registering event handler, etc.)
Event handler will receive an event with the request information
Event also has a method for opening a context-specific window
Message hub/manager thing
Init method for syncing up with calling website (either relying party or service provider web app)
Use postMessage once loaded to indicate ready to receive messages
Message queue and auto-rejection of messages of the same type (or perhaps in general)... “NotAllowedError” (can’t do two requests at once because of user interaction) -- maybe not a “queue” but a single request can be queued up
Design only supports one response from service provider app as well
APIs for registering hooks for handling certain types of messages such that if the messages don’t match an error will be returned (JavaScript polyfill library implements must handle these)
Service Provider Bridge (?)
Load service provider web app and communicate with it


*/

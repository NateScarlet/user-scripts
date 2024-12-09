// ==UserScript==
// @name     Disable P2P feature (WebRTC)
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description disable p2p connection on all page
// @grant    unsafeWindow
// @run-at   document-start
// @include	 *
// @version   2024.12.09+7b896c9c
// ==/UserScript==

"use strict";
(() => {
  // src/disable-p2p.user.ts
  ((win = window) => {
    delete win.RTCPeerConnection;
    delete win.mozRTCPeerConnection;
    delete win.webkitRTCPeerConnection;
    delete win.RTCDataChannel;
    delete win.DataChannel;
  })(unsafeWindow);
})();

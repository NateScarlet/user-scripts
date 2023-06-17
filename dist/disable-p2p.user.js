// ==UserScript==
// @name     Disable P2P feature (WebRTC)
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description disable p2p connection on all page (for firefox, go to `about:config` and set `media.peerconnection.enabled` to false instead)
// @grant    none
// @run-at   document-start
// @include	 *
// @version   2023.05.08+e4375f89
// ==/UserScript==

"use strict";
(() => {
  // src/disable-p2p.user.ts
  delete window.RTCPeerConnection;
  delete window.mozRTCPeerConnection;
  delete window.webkitRTCPeerConnection;
  delete window.RTCDataChannel;
  delete window.DataChannel;
})();

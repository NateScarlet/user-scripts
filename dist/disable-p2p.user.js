// ==UserScript==
// @name     Disable P2P feature (WebRTC)
// @namespace https://github.com/NateScarlet/user-scripts
// @description disable p2p connection on all page (for firefox, go to `about:config` and set `media.peerconnection.enabled` to false instead)
// @grant    none
// @run-at   document-start
// @include	 *
// @version   2023.05.08+9e0a978a
// ==/UserScript==

(() => {
  // src/disable-p2p.user.ts
  delete window.RTCPeerConnection;
  delete window.mozRTCPeerConnection;
  delete window.webkitRTCPeerConnection;
  delete window.RTCDataChannel;
  delete window.DataChannel;
})();

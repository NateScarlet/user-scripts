// ==UserScript==
// @name     Disable P2P feature (WebRTC)
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description disable p2p connection on all page
// @grant    unsafeWindow
// @run-at   document-start
// @include	 *
// ==/UserScript==

// document-start not work in firefox
// https://github.com/greasemonkey/greasemonkey/issues/2526

declare global {
  interface Window {
    RTCPeerConnection?: RTCPeerConnection;
    mozRTCPeerConnection?: RTCPeerConnection;
    webkitRTCPeerConnection?: RTCPeerConnection;
    RTCDataChannel?: RTCDataChannel;
    DataChannel?: RTCDataChannel;
  }
}

export {};

((win = window) => {
  delete win.RTCPeerConnection;
  delete win.mozRTCPeerConnection;
  delete win.webkitRTCPeerConnection;
  delete win.RTCDataChannel;
  delete win.DataChannel;
})(unsafeWindow);

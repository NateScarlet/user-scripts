// ==UserScript==
// @name     Remove Global Filter 移除全局滤镜
// @namespace https://github.com/NateScarlet/user-scripts
// @description remove global filter (e.g. grayscale) 移除全局滤镜（例如黑白效果）
// @grant    none
// @run-at   document-idle
// @include	 *
// ==/UserScript==

export {};

document.body.parentElement.style.filter = "none";

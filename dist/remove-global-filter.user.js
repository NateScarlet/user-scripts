// ==UserScript==
// @name     Remove Global Filter 移除全局滤镜
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description remove global filter (e.g. grayscale) 移除全局滤镜（例如黑白效果）
// @grant    none
// @run-at   document-idle
// @include	 *
// @version   2023.05.08+19b1e262
// ==/UserScript==

"use strict";
(() => {
  // src/remove-global-filter.user.ts
  document.body.parentElement.style.filter = "none";
})();

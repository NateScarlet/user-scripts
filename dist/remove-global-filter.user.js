// ==UserScript==
// @name     Remove Global Filter 移除全局滤镜
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description remove global filter (e.g. grayscale) 移除全局滤镜（例如黑白效果）
// @grant    none
// @run-at   document-idle
// @include	 *
// @version   2026.02.04+9ac38a21
// ==/UserScript==

"use strict";
(() => {
  // src/remove-global-filter.user.ts
  var _a;
  (_a = document.body.parentElement) == null ? void 0 : _a.style.setProperty("filter", "none");
})();

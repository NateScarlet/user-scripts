// ==UserScript==
// @name     Auto meta viewport
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description Use <meta name="viewport" content="width=device-width, initial-scale=1"> as default.
// @run-at   document-end
// @include	 *
// @version   2023.05.08+66b8f8ff
// ==/UserScript==

"use strict";
(() => {
  // src/auto-meta-viewport.user.ts
  function main() {
    if (document.querySelector('meta[name="viewport"]')) {
      return;
    }
    const el = document.createElement("meta");
    el.name = "viewport";
    el.content = "width=device-width, initial-scale=1";
    document.head.append(el);
  }
  main();
})();

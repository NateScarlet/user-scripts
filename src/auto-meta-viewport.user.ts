// ==UserScript==
// @name     Auto meta viewport
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description Use <meta name="viewport" content="width=device-width, initial-scale=1"> as default.
// @run-at   document-end
// @include	 *
// ==/UserScript==

export {};

function main(): void {
  if (document.querySelector('meta[name="viewport"]')) {
    return;
  }

  const el = document.createElement("meta");
  el.name = "viewport";
  el.content = "width=device-width, initial-scale=1";
  document.head.append(el);
}

main();

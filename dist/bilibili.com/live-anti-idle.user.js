// ==UserScript==
// @name     B站直播间防休眠
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 防止B站直播间自动停止播放
// @grant    none
// @include	 https://live.bilibili.com/*
// @include	 https://www.bilibili.com/blackboard/live/*
// @run-at   document-idle
// @version   2023.08.27+d75203f6
// ==/UserScript==

"use strict";
(() => {
  // src/bilibili.com/live-anti-idle.user.ts
  (() => {
    setInterval(() => {
      setTimeout(() => {
        document.body.dispatchEvent(
          new MouseEvent("mousemove", { bubbles: true })
        );
      }, Math.random() * 2e3);
    }, 1e4);
  })();
})();

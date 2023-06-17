// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 避免看到指定用户上传的视频，在用户个人主页和视频左上角会多出屏蔽按钮。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @run-at   document-start
// ==/UserScript==

// spell-checker: word bili bilibili upname datetime

import onDocumentReadyOnce from "@/utils/onDocumentReadyOnce";
import Polling from "@/utils/Polling";
import Disposal from "@/utils/Disposal";
import style from "./style";
import Component from "./components/Component";
import SettingsDrawer from "./components/SettingsDrawer";
import NavButton from "./components/NavButton";
import migrate from "./models/migrate";
import parseUserURL from "./utils/parseUserURL";
import UserBlockButton from "./components/UserBlockButton";
import parseVideoURL from "./utils/parseVideoURL";
import VideoDetailPatch from "./components/VideoDetailPatch";
import SSRVideoRankPatch from "./components/SSRVideoRankPatch";
import VueVideoRankPatch from "./components/VueVideoRankPatch";
import VideoListPatch from "./components/VideoListPatch";

export {};

function createApp(): Component {
  const rawURL = window.location.href;
  const settings = new SettingsDrawer();
  const components: Component[] = [settings, new NavButton(settings)];
  const user = parseUserURL(rawURL);
  const url = new URL(rawURL);

  if (user) {
    components.push(new UserBlockButton(user));
  } else if (parseVideoURL(rawURL)) {
    components.push(new VideoDetailPatch());
  } else if (
    url.host === "www.bilibili.com" &&
    url.pathname.startsWith("/v/popular/rank/all")
  ) {
    components.push(new SSRVideoRankPatch());
  } else if (
    url.host === "www.bilibili.com" &&
    url.pathname.startsWith("/v/popular/")
  ) {
    components.push(new VueVideoRankPatch());
  } else {
    components.push(new VideoListPatch());
  }

  return {
    render: () => components.forEach((i) => i.render()),
  };
}

async function main() {
  await migrate();

  const initialPath = window.location.pathname;
  const app = createApp();

  const d = new Disposal();
  d.push(
    new Polling({
      update: () => {
        if (window.location.pathname !== initialPath) {
          // route changed
          d.dispose();
          main();
          return;
        }
        style.inject();
        app.render();
      },
      scheduleNext: (update) => setTimeout(update, 100),
    })
  );
}

onDocumentReadyOnce(main);

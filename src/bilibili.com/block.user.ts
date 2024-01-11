// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 隐藏不感兴趣的内容，支持用户、首页频道推广和广告。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @run-at   document-start
// ==/UserScript==

// spell-checker: word bili bilibili upname datetime

import onDocumentReadyOnce from '@/utils/onDocumentReadyOnce';
import Polling from '@/utils/Polling';
import Disposal from '@/utils/Disposal';
import waitUntil from '@/utils/waitUntil';
import style from './style';
import Component from './components/Component';
import SettingsDrawer from './components/SettingsDrawer';
import FullHeaderButton from './components/FullHeaderButton';
import migrate from './models/migrate';
import parseUserURL from './utils/parseUserURL';
import UserBlockButton from './components/UserBlockButton';
import parseVideoURL from './utils/parseVideoURL';
import VideoDetailPatch from './components/VideoDetailPatch';
import SSRVideoRankPatch from './components/SSRVideoRankPatch';
import VueVideoRankPatch from './components/VueVideoRankPatch';
import VideoListPatch from './components/VideoListPatch';
import AdblockTipPatch from './components/AdblockTipPatch';
import HomePageFloorCardPatch from './components/HomePageFloorCardPatch';
import Context from './Context';
import MiniHeaderButton from './components/MiniHeaderButton';
import PlaylistPatch from './components/PlaylistPatch';

export {};

async function createApp(): Promise<Component> {
  const rawURL = window.location.href;
  const settings = new SettingsDrawer();
  const components: Component[] = [settings];
  const user = parseUserURL(rawURL);
  const url = new URL(rawURL);

  let isFullHeader = false as boolean;
  await waitUntil({
    ready: () => {
      if (document.querySelector('.right-entry')) {
        isFullHeader = true;
        return true;
      }
      if (document.querySelector('.nav-user-center .user-con:nth-child(2)')) {
        isFullHeader = false;
        return true;
      }
      return false;
    },
  });
  if (isFullHeader) {
    components.push(new FullHeaderButton(settings));
  } else {
    components.push(new MiniHeaderButton(settings));
  }

  const data = {
    query: '',
  };
  if (url.host === 'search.bilibili.com') {
    data.query = url.searchParams.get('keyword') ?? '';
  }
  const ctx = new Context(data);

  if (user) {
    components.push(new UserBlockButton(user));
  } else if (parseVideoURL(rawURL)) {
    components.push(new VideoDetailPatch(ctx));
  } else if (
    url.host === 'www.bilibili.com' &&
    url.pathname.startsWith('/v/popular/rank/all')
  ) {
    components.push(new SSRVideoRankPatch());
  } else if (
    url.host === 'www.bilibili.com' &&
    url.pathname.startsWith('/v/popular/')
  ) {
    components.push(new VueVideoRankPatch());
  } else if (
    url.host === 'www.bilibili.com' &&
    url.pathname.startsWith('/list/')
  ) {
    components.push(new PlaylistPatch(ctx));
  } else {
    components.push(new VideoListPatch(ctx));
  }

  if (url.host === 'www.bilibili.com' && url.pathname === '/') {
    components.push(new AdblockTipPatch(), new HomePageFloorCardPatch());
  }

  return {
    render: () => components.forEach((i) => i.render()),
  };
}

function routeKey() {
  const { host, pathname, search } = window.location;
  if (host === 'search.bilibili.com') {
    const q = new URLSearchParams(search);
    return `search:${q.get('keyword') ?? ''}`;
  }
  return pathname;
}

async function main() {
  await migrate();

  const initialRouteKey = routeKey();
  const app = await createApp();

  const d = new Disposal();
  d.push(
    new Polling({
      update: () => {
        if (
          (document.querySelector('.right-entry,.user-con:nth-child(2)')
            ?.childElementCount ?? 0) < 2
        ) {
          // not ready
          // https://greasyfork.org/zh-CN/scripts/465675-b%E7%AB%99%E7%94%A8%E6%88%B7%E5%B1%8F%E8%94%BD/discussions/198827
          return;
        }
        if (routeKey() !== initialRouteKey) {
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

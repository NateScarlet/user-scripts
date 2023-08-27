// ==UserScript==
// @name     Github anchor enhance
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description Enhance github repository link with badges
// @grant    GM.xmlHttpRequest
// @run-at   document-end
// @include	 *
// ==/UserScript==

export {};

// spell-checker: word codespaces

const reservedUsername = new Set([
  'topics',
  'search',
  'ghost',
  'pulls',
  'issues',
  'marketplace',
  'explore',
  'discover',
  'notifications',
  'new',
  'organizations',
  'settings',
  'site',
  'about',
  'contact',
  'pricing',
  'apps',
  'features',
  'password_reset',
  'trending',
  'collections',
  'events',
  'stars',
  'codespaces',
  'sponsors',
  'logout',
  'account',
]);

const allBadgeClasses = ['added-stars-badge', 'added-last-commit-badge'];

interface ParseURLResult {
  owner: string;
  repo: string;
}

const current = parseURL(location.href);

function parseURL(rawURL: string): ParseURLResult | undefined {
  const u = new URL(rawURL, document.baseURI);
  if (u.hostname !== 'github.com') {
    return;
  }

  const match = /^\/([^/]+?)\/([^/]+?)(?:.git)?\/?$/.exec(u.pathname);
  if (!match) {
    return;
  }
  const owner = match[1];
  const repo = match[2];
  if (owner === current?.owner && repo === current.repo) {
    return;
  }
  if (reservedUsername.has(owner)) {
    return;
  }
  return {
    owner,
    repo,
  };
}

async function appendBadge(
  el: HTMLElement,
  className: string,
  url: string
): Promise<void> {
  if (el.classList.contains(className)) {
    return;
  }
  return new Promise((resolve, reject): void => {
    GM.xmlHttpRequest({
      method: 'GET',
      url: url,
      onload: (resp) => {
        if (resp.status === 200) {
          if (!el.classList.contains(className)) {
            const img = document.createElement('img');
            img.src = `data:image/svg+xml;base64,${btoa(resp.response)}`;
            const containerClassNames = [
              'natescarlet-gmail-com',
              'badge-container',
            ];
            const selector = containerClassNames.map((i) => '.' + i).join('');
            const container: HTMLElement =
              el.querySelector(selector) || document.createElement('span');
            el.appendChild(container);
            container.classList.add(...containerClassNames);
            container.append(img);

            img.style.order = allBadgeClasses.indexOf(className).toString();
            container.style.display = 'inline-flex';
            el.classList.add(className);
          }
          resolve();
        }
        reject(`${resp.status}: ${url}`);
      },
      onerror: reject,
    });
  });
}

async function appendStarsBadge(
  el: HTMLAnchorElement,
  res: ParseURLResult
): Promise<void> {
  await appendBadge(
    el,
    'added-stars-badge',
    `https://img.shields.io/github/stars/${res.owner}/${res.repo}.svg?style=social`
  );
}

async function appendLastCommitBadge(
  el: HTMLAnchorElement,
  res: ParseURLResult
): Promise<void> {
  await appendBadge(
    el,
    'added-last-commit-badge',
    `https://img.shields.io/github/last-commit/${res.owner}/${res.repo}.svg`
  );
}

(async function (): Promise<void> {
  document.addEventListener(
    'mouseover',
    async (e) => {
      if (e.target instanceof HTMLAnchorElement) {
        const el = e.target;
        const res = parseURL(el.href);

        if (!res) {
          return;
        }
        try {
          await Promise.all([
            appendStarsBadge(el, res),
            appendLastCommitBadge(el, res),
          ]);
        } catch (err) {
          console.error(err);
        }
      }
    },
    {}
  );
})();

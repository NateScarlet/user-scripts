import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import { html, render } from 'lit-html';
import { mdiAccountCancelOutline, mdiAccountCheckOutline } from '@mdi/js';
import blockedUsers from '../models/blockedUsers';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

export default class VideoHoverButton {
  constructor(
    private readonly parentNode: Element | null | undefined,
    private readonly user: { id: string; name: string }
  ) {}

  public readonly render = () => {
    const { parentNode } = this;
    if (!parentNode) {
      return;
    }
    const parentKey = 'dde57f95-0cb5-4443-bbeb-2466d63db0f1';
    const key = 'a1161956-2be7-4796-9f1b-528707156b11';
    injectStyle(
      parentKey,
      `\
[data-${parentKey}]:hover [data-${key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
    );
    const el = obtainHTMLElementByDataKey({
      tag: 'div',
      key,
      parentNode,
      onDidCreate: (el) => {
        parentNode.setAttribute(`data-${parentKey}`, '');
        parentNode.append(el);
      },
    });
    const isBlocked = blockedUsers.has(this.user.id);
    render(
      html`
<button
  type="button"
  title="${isBlocked ? '取消屏蔽此用户' : '屏蔽此用户'}"
  class="rounded-md cursor-pointer  z-20 border-none ${
    isBlocked ? 'bg-white text-black' : 'text-white bg-[rgba(33,33,33,.8)]'
  }"
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) {
      blockedUsers.remove(this.user.id);
    } else {
      blockedUsers.add(this.user);
    }
  }}
>
  <svg viewBox="-3 -1 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${
      isBlocked ? mdiAccountCheckOutline : mdiAccountCancelOutline
    }>
  </svg>
</button>
    `,
      obtainStyledShadowRoot(el)
    );
  };
}

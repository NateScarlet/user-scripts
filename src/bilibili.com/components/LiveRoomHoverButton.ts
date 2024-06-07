import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import { html, render } from 'lit-html';
import { mdiCancel, mdiCheckCircleOutline } from '@mdi/js';
import injectStyle from '@/utils/injectStyle';
import blockedLiveRooms from '../models/blockedLiveRooms';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

export default class LiveRoomHoverButton {
  constructor(
    private readonly parentNode: Element | null | undefined,
    private readonly room: { id: string; owner: string }
  ) {}

  public readonly render = () => {
    const { parentNode } = this;
    if (!parentNode) {
      return;
    }
    const parentKey = '321c1408-3ba8-4f8e-8ec8-4c491cf648c6';
    const key = 'c2ad7200-7141-46cd-a0ce-ba71ca52e396';
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
    const isBlocked = blockedLiveRooms.has(this.room.id);
    render(
      html`
  <button
    type="button"
    title="${isBlocked ? '取消屏蔽此直播间' : '屏蔽此直播间'}"
    class="absolute top-2 left-2 p-1 rounded-md cursor-pointer isolate border-none ${
      isBlocked ? 'bg-white text-black' : 'text-white bg-[rgba(33,33,33,.8)]'
    }"
    style="z-index: 200;"
    @click=${(e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      blockedLiveRooms.toggle(this.room, !isBlocked);
    }}
  >
    <svg viewBox="0 0 24 24" class="h-8 fill-current">
      <path fill-rule="evenodd" clip-rule="evenodd" d=${
        isBlocked ? mdiCheckCircleOutline : mdiCancel
      }>
    </svg>
  </button>
    `,
      obtainStyledShadowRoot(el)
    );
  };
}

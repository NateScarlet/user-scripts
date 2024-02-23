import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import { html, render } from 'lit-html';
import { mdiCancel, mdiCheckCircleOutline } from '@mdi/js';
import style from '../style';
import blockedLiveRooms from '../models/blockedLiveRooms';

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
    const key = 'c2ad7200-7141-46cd-a0ce-ba71ca52e396';
    injectStyle(
      key,
      `\
[data-${key}]:hover button {
  opacity: 100;
  transition: opacity 0.2s linear 0.2s;
}

[data-${key}] button {
  opacity: 0;
  transition: opacity 0.2s linear 0s;
}
`
    );
    const el = obtainHTMLElementByDataKey({
      tag: 'div',
      key,
      parentNode,
      onDidCreate: (el) => {
        style.apply(el);
        parentNode.setAttribute(`data-${key}`, '');
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
      el
    );
  };
}

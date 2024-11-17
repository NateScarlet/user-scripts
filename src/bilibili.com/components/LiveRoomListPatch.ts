import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import randomUUID from '@/utils/randomUUID';
import { html, nothing, render } from 'lit-html';
import Context from '../Context';
import parseLiveRoomURL from '../utils/parseLiveRoomURL';
import LiveRoomHoverButton from './LiveRoomHoverButton';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

// spell-checker: word bili

export default class LiveRoomPatch {
  private disabled = false;

  private static readonly id = randomUUID();

  constructor(private readonly ctx: Context) {}

  public readonly render = () => {
    let matchCount = 0;

    let listEl: HTMLElement | undefined;
    document.querySelectorAll<HTMLElement>('a#card').forEach((i) => {
      const rawURL = i.getAttribute('href');
      if (!rawURL) {
        return;
      }
      const room = parseLiveRoomURL(rawURL);
      if (!room) {
        return;
      }
      const match = this.ctx.shouldExcludeLiveRoom({ room });
      if (match) {
        matchCount += 1;
      }

      let container = i;
      while (container.parentElement?.childElementCount === 1) {
        container = container.parentElement;
      }
      listEl = container.parentElement || undefined;
      const hidden = !this.disabled && match;
      setHTMLElementDisplayHidden(container, hidden);
      if (!hidden) {
        // spell-checker: word Item_nickName_KO2QE Item_cover-wrap_BmU4h
        new LiveRoomHoverButton(i.querySelector('.Item_cover-wrap_BmU4h'), {
          id: room.id,
          owner:
            i.querySelector('.Item_nickName_KO2QE')?.textContent || room.id,
        }).render();
      }
    });

    render(
      matchCount === 0
        ? nothing
        : html`
            <div class="w-full text-gray-500 text-center m-1">
              ${this.disabled
                ? html`${matchCount} 个直播间符合屏蔽规则`
                : html`已屏蔽 ${matchCount} 个直播间`}
              <button
                type="button"
                class="border rounded py-1 px-2 text-black hover:bg-gray-200 transition ease-in-out duration-200"
                @click=${() => {
                  this.disabled = !this.disabled;
                }}
              >
                ${this.disabled ? '屏蔽' : '全部显示'}
              </button>
            </div>
          `,
      obtainStyledShadowRoot(
        obtainHTMLElementByID({
          id: `live-room-list-patch-status-${LiveRoomPatch.id}`,
          tag: 'div',
          onDidCreate: (el) => {
            listEl?.parentElement?.insertBefore(el, listEl);
          },
        })
      )
    );
  };
}

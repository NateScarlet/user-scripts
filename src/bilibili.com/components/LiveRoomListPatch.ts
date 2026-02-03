import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import randomUUID from '@/utils/randomUUID';
import { mount } from 'svelte';
import { get, writable } from 'svelte/store';
import Context from '../Context';
import parseLiveRoomURL from '../utils/parseLiveRoomURL';
import LiveRoomHoverButton from './LiveRoomHoverButton.svelte';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import LiveRoomListStatus from './LiveRoomListStatus.svelte';

// spell-checker: word bili

export default class LiveRoomPatch {
  private readonly disabledStore = writable(false);

  private readonly matchCountStore = writable(0);

  private static readonly id = randomUUID();
  private static readonly parentKey = '321c1408-3ba8-4f8e-8ec8-4c491cf648c6';
  private static readonly key = 'c2ad7200-7141-46cd-a0ce-ba71ca52e396';

  private readonly instances = new WeakMap<HTMLElement, LiveRoomHoverButton>();

  constructor(private readonly ctx: Context) {}

  public readonly render = () => {
    injectStyle(
      LiveRoomPatch.parentKey,
      `\
[data-${LiveRoomPatch.parentKey}]:hover [data-${LiveRoomPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${LiveRoomPatch.parentKey}] [data-${LiveRoomPatch.key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
    );
    let matchCount = 0;
    const disabled = get(this.disabledStore);

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
      const hidden = !disabled && match;
      setHTMLElementDisplayHidden(container, hidden);
      if (!hidden) {
        // spell-checker: word Item_nickName_KO2QE Item_cover-wrap_BmU4h
        const target = i.querySelector('.Item_cover-wrap_BmU4h');
        if (target) {
          const roomData = {
            id: room.id,
            owner:
              i.querySelector('.Item_nickName_KO2QE')?.textContent || room.id,
          };

          const wrapper = obtainHTMLElementByDataKey({
            tag: 'div',
            key: LiveRoomPatch.key,
            parentNode: target,
            onDidCreate: (el) => {
              target.setAttribute(`data-${LiveRoomPatch.parentKey}`, '');
              target.append(el);
              const s = mount(LiveRoomHoverButton, {
                target: obtainStyledShadowRoot(el),
                props: {
                  room: roomData,
                },
              });
              this.instances.set(el, s);
            },
          });

          const comp = this.instances.get(wrapper);
          if (comp) {
            comp.setRoom(roomData);
          }
        }
      }
    });

    this.matchCountStore.set(matchCount);

    obtainHTMLElementByID({
      id: `live-room-list-patch-status-${LiveRoomPatch.id}`,
      tag: 'div',
      onDidCreate: (el) => {
        listEl?.parentElement?.insertBefore(el, listEl);
        const shadowRoot = obtainStyledShadowRoot(el);
        mount(LiveRoomListStatus, {
          target: shadowRoot,
          props: {
            matchCountStore: this.matchCountStore,
            disabledStore: this.disabledStore,
            onToggleDisabled: () => {
              this.disabledStore.update((v) => !v);
              this.render();
            },
          },
        });
      },
    });
  };
}

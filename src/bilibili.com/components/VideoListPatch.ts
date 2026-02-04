import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import randomUUID from '@/utils/randomUUID';
import { mount } from 'svelte';
import { writable, get } from 'svelte/store';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton.svelte';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import parseVideoURL from '../utils/parseVideoURL';
import VideoListPatchStatus from './VideoListPatchStatus.svelte';

// spell-checker: word bili

export default class VideoListPatch {
  private readonly matchCountStore = writable(0);

  private readonly disabledStore = writable(false);

  private static readonly id = randomUUID();
  private static readonly parentKey = 'dde57f95-0cb5-4443-bbeb-2466d63db0f1';
  private static readonly key = 'a1161956-2be7-4796-9f1b-528707156b11';

  private readonly instances = new WeakMap<HTMLElement, VideoHoverButton>();

  private static readonly knownParentContainerClass = new Set([
    'bili-feed-card',
    'feed-card',
  ]);

  constructor(private readonly ctx: Context) {}

  public readonly render = () => {
    injectStyle(
      VideoListPatch.parentKey,
      `\
[data-${VideoListPatch.parentKey}]:hover [data-${VideoListPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${VideoListPatch.parentKey}] [data-${VideoListPatch.key}] {
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
    document.querySelectorAll<HTMLElement>('.bili-video-card').forEach((i) => {
      const rawURL = i
        .querySelector('a.bili-video-card__info--owner')
        ?.getAttribute('href');
      if (!rawURL) {
        return;
      }
      const user = parseUserURL(rawURL);
      let match = false;
      let note = '';
      if (user) {
        const authorEl = i.querySelector('.bili-video-card__info--author');
        const authorName =
          (authorEl?.getAttribute('title') || authorEl?.textContent) ?? '';
        const duration =
          i
            .querySelector('.bili-video-card__stats__duration')
            ?.textContent?.trim() ?? '';
        const titleEl = i.querySelector('.bili-video-card__info--tit');
        const title =
          (titleEl?.getAttribute('title') || titleEl?.textContent) ?? '';
        if (title) {
          note = `${title}`;
        }
        const video = parseVideoURL(
          titleEl?.parentElement?.getAttribute('href') ??
            titleEl?.querySelector('a')?.getAttribute('href')
        );
        if (video?.id) {
          note += `(${video.id})`;
        }
        // spell-checker: words rcmd
        const isPromoted =
          i.classList.contains('is-rcmd') &&
          !i.classList.contains('enable-no-interest');
        match = this.ctx.shouldExcludeVideo({
          user: { ...user, name: authorName },
          duration,
          title,
          isPromoted,
        });
      } else {
        // assume advertisement
        match = !videoListSettings.allowAdvertisement;
      }

      if (match) {
        matchCount += 1;
      }

      let container = i;
      while (
        container.parentElement?.childElementCount === 1 ||
        Array.from(container.parentElement?.classList.values() ?? []).some(
          (cls) => VideoListPatch.knownParentContainerClass.has(cls)
        )
      ) {
        container = container.parentElement!;
      }
      listEl = container.parentElement || undefined;
      const hidden = !disabled && match;
      setHTMLElementDisplayHidden(container, hidden);
      if (user && !hidden) {
        const target = i.querySelector('.bili-video-card__image--wrap');
        if (target) {
          const userData = {
            id: user.id,
            name:
              i.querySelector('.bili-video-card__info--author')?.textContent ||
              user.id,
            note,
          };
          const wrapper = obtainHTMLElementByDataKey({
            tag: 'div',
            key: VideoListPatch.key,
            parentNode: target,
            onDidCreate: (el) => {
              target.setAttribute(`data-${VideoListPatch.parentKey}`, '');
              target.append(el);
              const s = mount(VideoHoverButton, {
                target: obtainStyledShadowRoot(el),
                props: {
                  user: userData,
                },
              });
              this.instances.set(el, s);
            },
          });
          const comp = this.instances.get(wrapper);
          if (comp) {
            comp.setUser(userData);
          }
        }
      }
    });

    this.matchCountStore.set(matchCount);

    obtainHTMLElementByID({
      id: `video-list-patch-status-${VideoListPatch.id}`,
      tag: 'div',
      onDidCreate: (el) => {
        listEl?.parentElement?.insertBefore(el, listEl);
        const shadowRoot = obtainStyledShadowRoot(el);
        // Note: The VideoListPatchStatus component expects { stateStore }
        // where stateStore is Writable<{ matchCount: number; disabled: boolean }>
        // But here I have separate stores. I should combine them or update the component.
        // It's cleaner to update the component or create a derived store.
        // But I can't create derived store easily inside this render loop without potential issues.
        // Let's create a combined store.
        const stateStore = writable({ matchCount, disabled });
        this.matchCountStore.subscribe((v) => {
          stateStore.update((s) => ({ ...s, matchCount: v }));
        });
        this.disabledStore.subscribe((v) => {
          stateStore.update((s) => ({ ...s, disabled: v }));
        });

        mount(VideoListPatchStatus, {
          target: shadowRoot,
          props: {
            stateStore,
            onToggle: () => {
              this.disabledStore.update((v) => !v);
              this.render();
            },
          },
        });
      },
    });
  };
}

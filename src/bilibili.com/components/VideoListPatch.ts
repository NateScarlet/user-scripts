import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import randomUUID from '@/utils/randomUUID';
import { html, nothing, render } from 'lit-html';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

// spell-checker: word bili

export default class VideoListPatch {
  private disabled = false;

  private static readonly id = randomUUID();

  constructor(private readonly ctx: Context) {}

  public readonly render = () => {
    let matchCount = 0;

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
      if (user) {
        const duration =
          i
            .querySelector('.bili-video-card__stats__duration')
            ?.textContent?.trim() ?? '';
        const title =
          (i
            .querySelector('.bili-video-card__info--tit')
            ?.getAttribute('title') ||
            i.querySelector('.bili-video-card__info--tit')?.textContent) ??
          '';
        match = this.ctx.shouldExcludeVideo({ user, duration, title });
      } else {
        // assume advertisement
        match = !videoListSettings.allowAdvertisement;
      }

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
      if (user && !hidden) {
        new VideoHoverButton(i.querySelector('.bili-video-card__image--wrap'), {
          id: user.id,
          name:
            i.querySelector('.bili-video-card__info--author')?.textContent ||
            user.id,
        }).render();
      }
    });

    render(
      matchCount === 0
        ? nothing
        : html`
            <div class="w-full text-gray-500 text-center m-1">
              ${this.disabled
                ? html`${matchCount} 条视频符合屏蔽规则`
                : html`已屏蔽 ${matchCount} 条视频`}
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
          id: `video-list-patch-status-${VideoListPatch.id}`,
          tag: 'div',
          onDidCreate: (el) => {
            listEl?.parentElement?.insertBefore(el, listEl);
          },
        })
      )
    );
  };
}

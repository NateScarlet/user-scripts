import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton.svelte';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import parseVideoURL from '../utils/parseVideoURL';
import { mount } from 'svelte';

// spell-checker: word upname
export default class VideoDetailPatch {
  constructor(private readonly ctx: Context) {}

  private readonly blockedTitles = new Set<string>();

  private readonly instances = new WeakMap<HTMLElement, VideoHoverButton>();

  public readonly render = () => {
    document
      .querySelectorAll<HTMLElement>('.video-page-card-small')
      .forEach((i) => {
        const rawURL = i.querySelector('.upname a')?.getAttribute('href');
        if (!rawURL) {
          return;
        }
        const user = parseUserURL(rawURL);
        let hidden = false;
        let note = '';
        if (user) {
          const duration =
            i.querySelector('.duration')?.textContent?.trim() ?? '';
          const titleEl = i.querySelector('.title');
          const title =
            (titleEl?.getAttribute('title') || titleEl?.textContent) ?? '';
          if (title) {
            note = `${title}`;
          }
          const video = parseVideoURL(
            titleEl?.parentElement?.getAttribute('href')
          );
          if (video?.id) {
            note += `(${video.id})`;
          }
          hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
          if (hidden) {
            this.blockedTitles.add(title);
          }
        } else {
          // assume advertisement
          hidden = !videoListSettings.allowAdvertisement;
        }

        setHTMLElementDisplayHidden(i, hidden);
        if (user && !hidden) {
          const target = i.querySelector('.pic-box');
          if (target) {
            const userData = {
              id: user.id,
              name: i.querySelector('.upname .name')?.textContent || user.id,
              note,
            };
            const wrapper = obtainHTMLElementByDataKey({
              tag: 'div',
              key: 'video-detail-hover-button',
              parentNode: target,
              onDidCreate: (el) => {
                target.append(el);
                const s = mount(VideoHoverButton, {
                  target: el,
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

    document
      .querySelectorAll<HTMLElement>('.bpx-player-ending-related-item')
      .forEach((i) => {
        const title = i.querySelector(
          '.bpx-player-ending-related-item-title'
        )?.textContent;
        if (!title) {
          return;
        }
        const hidden =
          this.blockedTitles.has(title) ||
          this.ctx.shouldExcludeVideo({ title });
        setHTMLElementDisplayHidden(i, hidden);
      });
  };
}

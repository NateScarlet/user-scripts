import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton.svelte';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import { mount } from 'svelte';

// spell-checker: word upname
export default class PlaylistPatch {
  constructor(private readonly ctx: Context) {}

  private readonly instances = new WeakMap<HTMLElement, VideoHoverButton>();

  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.video-card').forEach((i) => {
      const rawURL = i.querySelector('a.upname')?.getAttribute('href');
      if (!rawURL) {
        return;
      }
      const user = parseUserURL(rawURL);

      let hidden = false;
      if (user) {
        const duration =
          i.querySelector('.duration')?.textContent?.trim() ?? '';
        const title =
          (i.querySelector('.title')?.getAttribute('title') ||
            i.querySelector('.title')?.textContent) ??
          '';
        hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
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
            note: '',
          };
          const wrapper = obtainHTMLElementByDataKey({
            tag: 'div',
            key: 'playlist-video-hover-button',
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
  };
}

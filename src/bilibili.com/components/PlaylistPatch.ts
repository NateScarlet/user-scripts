import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import parseUserURL from '../utils/parseUserURL';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import renderVideoHoverButton from './renderVideoHoverButton';

// spell-checker: word upname
export default class PlaylistPatch {
  constructor(private readonly ctx: Context) {}

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
          renderVideoHoverButton(target, {
            id: user.id,
            name: i.querySelector('.upname .name')?.textContent || user.id,
            note: '',
          });
        }
      }
    });
  };
}

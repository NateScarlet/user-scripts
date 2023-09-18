import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';

// spell-checker: word bili

export default class VideoListPatch {
  constructor(private readonly ctx: Context) {}

  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.bili-video-card').forEach((i) => {
      const rawURL = i
        .querySelector('a.bili-video-card__info--owner')
        ?.getAttribute('href');
      if (!rawURL) {
        return;
      }
      const user = parseUserURL(rawURL);
      let hidden = false;
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
        hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
      } else {
        // assume advertisement
        hidden = !videoListSettings.allowAdvertisement;
      }

      let container = i;
      while (container.parentElement?.childElementCount === 1) {
        container = container.parentElement;
      }

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
  };
}

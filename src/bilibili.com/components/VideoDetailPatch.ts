import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton';
import videoListSettings from '../models/videoListSettings';
import Context from '../Context';
import parseVideoURL from '../utils/parseVideoURL';

// spell-checker: word upname
export default class VideoDetailPatch {
  constructor(private readonly ctx: Context) {}

  private readonly blockedTitles = new Set<string>();

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
          new VideoHoverButton(i.querySelector('.pic-box'), {
            id: user.id,
            name: i.querySelector('.upname .name')?.textContent || user.id,
            note,
          }).render();
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

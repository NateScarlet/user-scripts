import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import homePageSettings from '../models/homePageSettings';
import HomePageFloorCardHoverButton from './HomePageFloorCardHoverButton';

export default class HomePageFloorCardPatch {
  public readonly render = () => {
    document
      .querySelectorAll<HTMLElement>('.floor-single-card')
      .forEach((el) => {
        const channel = el.querySelector('.floor-title')?.textContent?.trim();
        if (!channel) {
          return;
        }
        const i = { channel };
        const hidden = homePageSettings.floorCard.shouldExclude(i);
        setHTMLElementDisplayHidden(el, hidden);
        if (!hidden) {
          new HomePageFloorCardHoverButton(
            el.querySelector('.cover-container'),
            i
          ).render();
        }
      });
  };
}

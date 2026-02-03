import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import injectStyle from '@/utils/injectStyle';
import homePageSettings from '../models/homePageSettings';
import HomePageFloorCardHoverButton from './HomePageFloorCardHoverButton.svelte';
import { mount } from 'svelte';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';

export default class HomePageFloorCardPatch {
  private readonly instances = new WeakMap<
    HTMLElement,
    HomePageFloorCardHoverButton
  >();

  private static readonly parentKey = '51d5da07-ab2d-4342-8496-c3c53980bb74';
  private static readonly key = '85e3e435-2ad2-4a7d-839f-69318799db0f';

  public readonly render = () => {
    injectStyle(
      HomePageFloorCardPatch.parentKey,
      `\
[data-${HomePageFloorCardPatch.parentKey}]:hover [data-${HomePageFloorCardPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${HomePageFloorCardPatch.parentKey}] [data-${HomePageFloorCardPatch.key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
    );
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
          const target = el.querySelector('.cover-container');
          if (target) {
            const wrapper = obtainHTMLElementByDataKey({
              tag: 'div',
              key: HomePageFloorCardPatch.key,
              parentNode: target,
              onDidCreate: (el) => {
                target.setAttribute(
                  `data-${HomePageFloorCardPatch.parentKey}`,
                  ''
                );
                target.append(el);
                const s = mount(HomePageFloorCardHoverButton, {
                  target: obtainStyledShadowRoot(el),
                  props: {
                    floorCard: i,
                  },
                });
                this.instances.set(el, s);
              },
            });
            const comp = this.instances.get(wrapper);
            if (comp) {
              comp.setFloorCard(i);
            }
          }
        }
      });
  };
}

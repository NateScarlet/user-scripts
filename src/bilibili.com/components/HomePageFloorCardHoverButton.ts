import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import { html, render } from 'lit-html';
import { mdiEyeOff } from '@mdi/js';
import injectStyle from '@/utils/injectStyle';
import homePageSettings from '../models/homePageSettings';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

export default class HomePageFloorCardHoverButton {
  constructor(
    private readonly parentNode: Element | null | undefined,
    private readonly floorCard: { channel: string }
  ) {}

  public readonly render = () => {
    const { parentNode } = this;
    if (!parentNode) {
      return;
    }
    const parentKey = '51d5da07-ab2d-4342-8496-c3c53980bb74';
    const key = '85e3e435-2ad2-4a7d-839f-69318799db0f';
    injectStyle(
      parentKey,
      `\
[data-${parentKey}]:hover [data-${key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
    );
    const el = obtainHTMLElementByDataKey({
      tag: 'div',
      key,
      parentNode,
      onDidCreate: (el) => {
        parentNode.setAttribute(`data-${parentKey}`, '');
        parentNode.append(el);
      },
    });
    render(
      html`
<button
  type="button"
  title="屏蔽此频道的楼层卡片"
  class="absolute top-2 left-2 rounded-md cursor-pointer text-white bg-[rgba(33,33,33,.8)] z-20 border-none"
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    homePageSettings.floorCard.excludeByChannel = [
      ...homePageSettings.floorCard.excludeByChannel,
      this.floorCard.channel,
    ];
  }}
>
  <svg viewBox="-2 -2 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOff}>
  </svg>
</button>
    `,
      obtainStyledShadowRoot(el)
    );
  };
}

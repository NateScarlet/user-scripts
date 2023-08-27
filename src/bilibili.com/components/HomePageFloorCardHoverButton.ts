import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import { html, render } from 'lit-html';
import { mdiEyeOff } from '@mdi/js';
import style from '../style';
import homePageSettings from '../models/homePageSettings';

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
    const key = '85e3e435-2ad2-4a7d-839f-69318799db0f';
    injectStyle(
      key,
      `\
[data-${key}]:hover button {
  opacity: 100;
  transition: opacity 0.2s linear 0.2s;
}

[data-${key}] button {
  opacity: 0;
  transition: opacity 0.2s linear 0s;
}
`
    );
    const el = obtainHTMLElementByDataKey({
      tag: 'div',
      key,
      parentNode,
      onDidCreate: (el) => {
        style.apply(el);
        parentNode.setAttribute(`data-${key}`, '');
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
      el
    );
  };
}

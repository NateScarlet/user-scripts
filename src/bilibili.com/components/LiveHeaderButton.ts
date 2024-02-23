import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { render, html } from 'lit-html';
import randomUUID from '@/utils/randomUUID';
import isNonNull from '@/utils/isNonNull';
import style from '../style';
import SettingsDrawer from './SettingsDrawer';

export default class LiveHeaderButton {
  private static readonly id = `live-header-button-${randomUUID()}`;

  private readonly settings: SettingsDrawer;

  constructor(settings: SettingsDrawer) {
    this.settings = settings;
  }

  public readonly render = () => {
    // spell-checker: word ctnr
    const parent = document.querySelector('.link-navbar');
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID({
      tag: 'div',
      id: LiveHeaderButton.id,
      onDidCreate: (el) => {
        style.apply(el);
        el.style.fontSize = '14px';
        parent.append(...[el, parent.lastChild].filter(isNonNull));
      },
    });
    render(
      html`
        <button
          type="button"
          class="h-full p-2"
          @click=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            this.settings.open();
          }}
        >
          <span class="name">屏蔽</span>
        </button>
      `,
      container
    );
  };
}

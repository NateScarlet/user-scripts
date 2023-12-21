import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { render, html } from 'lit-html';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import style from '../style';
import SettingsDrawer from './SettingsDrawer';

export default class MiniHeaderButton {
  private static readonly id = `mini-header-button-${randomUUID()}`;

  private readonly settings: SettingsDrawer;

  constructor(settings: SettingsDrawer) {
    this.settings = settings;
  }

  public readonly render = () => {
    const parent = document.querySelector(
      '.nav-user-center .user-con:nth-child(2)'
    );
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID({
      tag: 'div',
      id: MiniHeaderButton.id,
      onDidCreate: (el) => {
        style.apply(el);
        el.classList.add('item');
        parent.prepend(...[parent.firstChild, el].filter(isNonNull));
      },
    });
    render(
      html`
        <button
          type="button"
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

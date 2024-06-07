import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { render, html } from 'lit-html';
import randomUUID from '@/utils/randomUUID';
import isNonNull from '@/utils/isNonNull';
import { mdiEyeOffOutline } from '@mdi/js';
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
        el.style.fontSize = '14px';
        parent.append(...[el, parent.lastChild].filter(isNonNull));
      },
    });
    render(
      html`
      <div
        style="display: flex; align-items: center; margin: 0 20px;flex-direction: column;gap: 4px;padding: 12px;font-size: 14px; cursor: pointer;"
        @click=${(e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          this.settings.open();
        }}
      >
        <svg viewBox="2 2 20 20" style="height: 20px; fill: currentColor;">
          <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOffOutline}>
        </svg>
        <span>屏蔽</span>
      </div>
      `,
      container
    );
  };
}

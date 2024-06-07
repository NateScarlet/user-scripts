import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mdiEyeOffOutline } from '@mdi/js';
import { render, html } from 'lit-html';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import SettingsDrawer from './SettingsDrawer';

export default class FullHeaderButton {
  private static readonly id = `full-header-button-${randomUUID()}`;

  private readonly settings: SettingsDrawer;

  constructor(settings: SettingsDrawer) {
    this.settings = settings;
  }

  public readonly render = () => {
    const parent = document.querySelector('.right-entry');
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID({
      tag: 'li',
      id: FullHeaderButton.id,
      onDidCreate: (el) => {
        el.classList.add('right-entry-item');
        parent.prepend(...[parent.firstChild, el].filter(isNonNull));
      },
    });
    render(
      html`
  <button
    type="button"
    class="right-entry__outside" 
    @click=${(e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.settings.open();
    }}
  >
    <svg viewBox="2 2 20 20" class="right-entry-icon" style="height: 20px; fill: currentColor;">
      <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOffOutline}>
    </svg>
    <span class="right-entry-text">屏蔽</span>
  </button>
`,
      container
    );
  };
}

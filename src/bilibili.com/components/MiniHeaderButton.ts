import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mount } from 'svelte';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import SettingsDrawer from './SettingsDrawer';
import MiniHeaderButtonComponent from './MiniHeaderButton.svelte';

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
        el.classList.add('item');
        parent.prepend(...[parent.firstChild, el].filter(isNonNull));
        mount(MiniHeaderButtonComponent, {
          target: el,
          props: {
            settings: this.settings,
          },
        });
      },
    });
  };
}

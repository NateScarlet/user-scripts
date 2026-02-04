import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mount } from 'svelte';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import SettingsDrawer from './SettingsDrawer';
import FullHeaderButtonComponent from './FullHeaderButton.svelte';

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
    void obtainHTMLElementByID({
      tag: 'li',
      id: FullHeaderButton.id,
      onDidCreate: (el) => {
        el.classList.add('right-entry-item');
        parent.prepend(...[parent.firstChild, el].filter(isNonNull));
        mount(FullHeaderButtonComponent, {
          target: el,
          props: {
            settings: this.settings,
          },
        });
      },
    });
  };
}

import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mount } from 'svelte';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import SettingsDrawer from './SettingsDrawer';
import FullHeaderButtonComponent from './FullHeaderButton2609.svelte';

export default class FullHeaderButton2609 {
  private static readonly id = `full-header-button-${randomUUID()}`;

  private readonly settings: SettingsDrawer;

  constructor(settings: SettingsDrawer) {
    this.settings = settings;
  }

  public readonly render = () => {
    const parent = document.querySelector('.right-entry__main');
    if (!parent) {
      return;
    }
    void obtainHTMLElementByID({
      tag: 'div',
      id: FullHeaderButton2609.id,
      onDidCreate: (el) => {
        el.classList.add('right-entry__item');
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

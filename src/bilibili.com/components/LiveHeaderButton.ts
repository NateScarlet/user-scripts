import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mount } from 'svelte';
import randomUUID from '@/utils/randomUUID';
import isNonNull from '@/utils/isNonNull';
import SettingsDrawer from './SettingsDrawer';
import LiveHeaderButtonComponent from './LiveHeaderButton.svelte';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';

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
        mount(LiveHeaderButtonComponent, {
          target: el,
          props: {
            onClick: () => this.settings.open(),
          },
        });
      },
    });
  };
}

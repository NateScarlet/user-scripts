import { mount } from 'svelte';
import Component from './SettingsDrawer.svelte';
import obtainStyledShadowRoot from '../../utils/obtainStyledShadowRoot';
import randomUUID from '@/utils/randomUUID';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';

export default class SettingsDrawer {
  private static readonly id: string = `settings-${randomUUID()}`;

  private component?: Component;

  public readonly open = () => {
    this.component?.open();
  };

  public readonly close = () => {
    this.component?.close();
  };

  public readonly render = () => {
    obtainHTMLElementByID({
      tag: 'div',
      id: SettingsDrawer.id,
      onDidCreate: (el) => {
        el.style.position = 'fixed';
        el.style.zIndex = '9999';
        document.body.append(el);
        this.component = mount(Component, {
          target: obtainStyledShadowRoot(el),
        });
      },
    });
  };
}

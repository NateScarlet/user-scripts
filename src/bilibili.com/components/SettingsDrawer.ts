import { mount } from 'svelte';
import SettingsDrawerComponent from './SettingsDrawer/index.svelte';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import randomUUID from '@/utils/randomUUID';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';

export default class SettingsDrawer {
  private static readonly id: string = `settings-${randomUUID()}`;

  private component?: SettingsDrawerComponent;

  public readonly open = () => {
    this.component?.open();
  };

  public readonly close = () => {
    this.component?.close();
  };

  render() {
    obtainHTMLElementByID({
      tag: 'div',
      id: SettingsDrawer.id,
      onDidCreate: (el) => {
        el.style.position = 'fixed';
        el.style.zIndex = '9999';
        document.body.append(el);
        this.component = mount(SettingsDrawerComponent, {
          target: obtainStyledShadowRoot(el),
        });
      },
    });
  }
}

import { mount } from 'svelte';
import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import blockedUsers from '../models/blockedUsers';
import parseUserURL from '../utils/parseUserURL';
import VideoHoverButton from './VideoHoverButton.svelte';

export default class SSRVideoRankPatch {
  private readonly instances = new WeakMap<HTMLElement, VideoHoverButton>();

  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.rank-item').forEach((i) => {
      const user = parseUserURL(
        i.querySelector('.up-name')?.parentElement?.getAttribute('href')
      );
      if (!user) {
        return;
      }
      const name = i.querySelector('.up-name')?.textContent ?? '';

      const isBlocked = blockedUsers.has(user.id);
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        const target = i.querySelector('.img');
        if (target) {
          const userData = {
            id: user.id,
            name,
            note: '',
          };
          const wrapper = obtainHTMLElementByDataKey({
            tag: 'div',
            key: 'ssr-video-rank-hover-button',
            parentNode: target,
            onDidCreate: (el) => {
              target.append(el);
              const s = mount(VideoHoverButton, {
                target: el,
                props: {
                  user: userData,
                },
              });
              this.instances.set(el, s);
            },
          });
          const comp = this.instances.get(wrapper);
          if (comp) {
            comp.setUser(userData);
          }
        }
      }
    });
  };
}

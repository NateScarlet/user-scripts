import castPlainObject from '@/utils/castPlainObject';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import evalInContentScope from '@/utils/evalInContentScope';
import getElementSelector from '@/utils/getElementSelector';
import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import blockedUsers from '../models/blockedUsers';
import VideoHoverButton from './VideoHoverButton.svelte';
import { mount } from 'svelte';

export default class VueVideoRankPatch {
  private readonly instances = new WeakMap<HTMLElement, VideoHoverButton>();

  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.video-card').forEach((i) => {
      const selector = getElementSelector(i);
      const videoData = evalInContentScope(
        `document.querySelector(${JSON.stringify(
          selector
        )}).__vue__._props.videoData`
      );
      // spell-checker: words bvid
      const { owner, title, bvid } = castPlainObject(videoData);
      const { mid, name } = castPlainObject(owner);
      if (typeof mid !== 'number' || typeof name !== 'string') {
        return;
      }

      const userID = mid.toString();
      const isBlocked = blockedUsers.has(userID);
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        const target = i.querySelector('.video-card__content');
        if (target) {
          const userData = {
            id: userID,
            name,
            note:
              (typeof title === 'string' ? title : '') +
              (typeof bvid === 'string' ? `(${bvid})` : ''),
          };
          const wrapper = obtainHTMLElementByDataKey({
            tag: 'div',
            key: 'vue-video-rank-hover-button',
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

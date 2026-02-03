import isNonNull from '@/utils/isNonNull';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mount } from 'svelte';
import randomUUID from '@/utils/randomUUID';
import UserBlockButtonInline from './UserBlockButtonInline.svelte';
import UserBlockStatus from './UserBlockStatus.svelte';
import blockedUsers from '../models/blockedUsers';

export default class UserBlockButton {
  private static readonly id = `user-block-button-${randomUUID()}`;

  constructor(private readonly user: { id: string }) {}

  public readonly render = () => {
    const parentV1 = document.querySelector('.h-action');
    if (parentV1) {
      obtainHTMLElementByID({
        tag: 'div',
        id: UserBlockButton.id,
        onDidCreate: (el) => {
          el.style.display = 'inline';
          parentV1.append(...[el, parentV1.lastChild].filter(isNonNull));
          mount(UserBlockButtonInline, {
            target: el,
            props: {
              user: this.user,
            },
          });
        },
      });
      return;
    }

    const parentV2 = document.querySelector('.operations .interactions');
    if (parentV2) {
      obtainHTMLElementByID({
        tag: 'div',
        id: UserBlockButton.id,
        onDidCreate: (el) => {
          el.style.cssText = `\
cursor: pointer;
display: flex;
justify-content: center;
align-items: center;
width: 150px;
height: 34px;
border-radius: 6px;
font-size: 14px;
font-weight: 700;
color: var(--text_white);
border: 1px solid rgba(255,255,255,.2);
background-color: rgba(255,255,255,.14);
transition: all .3s;
margin-right: 24px;
`;
          el.addEventListener('mouseenter', () => {
            el.style.backgroundColor = 'rgba(255,255,255,.4)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.backgroundColor = 'rgba(255,255,255,.14)';
          });
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            blockedUsers.toggle({
              id: this.user.id,
              name:
                (document.querySelector('#h-name, .nickname') as HTMLElement)
                  ?.innerText ?? '',
            });
          });
          parentV2.append(...[el, parentV2.lastChild].filter(isNonNull));
          mount(UserBlockStatus, {
            target: el,
            props: {
              user: this.user,
            },
          });
        },
      });
    }
  };
}

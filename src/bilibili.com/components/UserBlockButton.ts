import isNonNull from '@/utils/isNonNull';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { render, html } from 'lit-html';
import randomUUID from '@/utils/randomUUID';
import blockedUsers from '../models/blockedUsers';

export default class UserBlockButton {
  private static readonly id = `user-block-button-${randomUUID()}`;

  constructor(private readonly user: { id: string }) {}

  public readonly render = () => {
    const parentV1 = document.querySelector('.h-action');
    if (parentV1) {
      const container = obtainHTMLElementByID({
        tag: 'div',
        id: UserBlockButton.id,
        onDidCreate: (el) => {
          el.style.display = 'inline';
          parentV1.append(...[el, parentV1.lastChild].filter(isNonNull));
        },
      });
      const isBlocked = blockedUsers.has(this.user.id);
      render(
        html`
          <span class="h-f-btn" @click=${this.onClick}>
            ${isBlocked ? '取消屏蔽' : '屏蔽'}
          </span>
        `,
        container
      );
      return;
    }

    const parentV2 = document.querySelector('.operations .interactions');
    if (parentV2) {
      const container = obtainHTMLElementByID({
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
            this.onClick(e);
          });
          parentV2.append(...[el, parentV2.lastChild].filter(isNonNull));
        },
      });
      const isBlocked = blockedUsers.has(this.user.id);
      render(
        html`<span> ${isBlocked ? '取消屏蔽' : '屏蔽'} </span>`,
        container
      );
    }
  };

  public readonly onClick = (e: MouseEvent) => {
    e.stopPropagation();
    blockedUsers.toggle({
      id: this.user.id,
      name:
        document.querySelector<HTMLElement>('#h-name, .nickname')?.innerText ??
        '',
    });
  };
}

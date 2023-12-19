import isNonNull from '@/utils/isNonNull';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { render, html } from 'lit-html';
import randomUUID from '@/utils/randomUUID';
import blockedUsers from '../models/blockedUsers';

export default class UserBlockButton {
  private static readonly id = `user-block-button-${randomUUID()}`;

  constructor(private readonly user: { id: string }) {}

  public readonly render = () => {
    const parent = document.querySelector('.h-action');
    if (!parent) {
      return;
    }

    const container = obtainHTMLElementByID({
      tag: 'div',
      id: UserBlockButton.id,
      onDidCreate: (el) => {
        el.style.display = 'inline';
        parent.append(...[el, parent.lastChild].filter(isNonNull));
      },
    });
    const isBlocked = blockedUsers.has(this.user.id);
    render(
      html`
        <span
          class="h-f-btn"
          @click=${(e: MouseEvent) => {
            e.stopPropagation();
            blockedUsers.toggle({
              id: this.user.id,
              name: document.getElementById('h-name')?.innerText ?? '',
            });
          }}
        >
          ${isBlocked ? '取消屏蔽' : '屏蔽'}
        </span>
      `,
      container
    );
  };
}

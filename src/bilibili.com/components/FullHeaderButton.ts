import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import { mdiEyeOffOutline } from '@mdi/js';
import { render, html } from 'lit-html';
import isNonNull from '@/utils/isNonNull';
import randomUUID from '@/utils/randomUUID';
import SettingsDrawer from './SettingsDrawer';

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
    const container = obtainHTMLElementByID({
      tag: 'div',
      id: FullHeaderButton.id,
      onDidCreate: (el) => {
        document.body.appendChild(el)
      },
    });
    render(
      html`
  <button
    type="button"
    style="
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 99999; /* 确保在最上层 */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 10px 16px;
            background-color: white; /* 背景色，根据需要调整（如跟随夜间模式） */
            color: #333;             /* 文字颜色 */
            border: 1px solid #e0e0e0;
            border-radius: 50px;     /* 圆角胶囊样式 */
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* 悬浮阴影 */
            cursor: pointer;
            transition: transform 0.2s;
          "
          /* 添加简单的鼠标悬停效果（可选，通过 onmouseenter/leave 模拟 CSS hover） */
          @mouseenter=${(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          @mouseleave=${(e) => e.currentTarget.style.transform = 'scale(1)'}
    @click=${(e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.settings.open();
    }}
  >
    <svg viewBox="2 2 20 20" style="height: 20px; width: 20px; fill: currentColor;">
      <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOffOutline}>
    </svg>
    <span style="font-size: 14px; font-weight: 500;">屏蔽</span>
  </button>
`,
      container
    );
  };
}

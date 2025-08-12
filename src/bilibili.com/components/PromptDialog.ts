import { html, nothing, render } from 'lit-html';
import { mdiClose } from '@mdi/js';
import type { PromptDialogOptions } from '../utils/showPromptDialog';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import randomUUID from '@/utils/randomUUID';
import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import getCurrentTheme from '../utils/getCurrentTheme';

export default class PromptDialog {
  private isOpen = false;
  private active = false;
  private container?: HTMLElement;
  private shadowRoot?: ShadowRoot;
  private readonly id: string = `prompt-${randomUUID()}`;
  private value: string;

  constructor(
    private options: PromptDialogOptions,
    private onDidClose: (result: string | null) => void
  ) {
    this.value = options.value || '';
  }

  public dispose() {
    this.container?.remove();
  }

  public open() {
    if (this.isOpen) {
      return;
    }
    this.container = obtainHTMLElementByID({
      tag: 'div',
      id: this.id,
      onDidCreate: (el) => {
        el.role = 'dialog';
        el.style.position = 'fixed';
        el.style.zIndex = '10000';
        document.body.appendChild(el);
      },
    });
    this.shadowRoot = obtainStyledShadowRoot(this.container);
    this.active = true;
    this.render();

    // 触发打开动画
    setTimeout(() => {
      this.isOpen = true;
      this.render();

      // 自动聚焦
      if (this.shadowRoot) {
        const input = this.shadowRoot.getElementById('dialog-input');
        if (input instanceof HTMLInputElement) {
          input.select();
          input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 20);
  }

  public close(result: string | null) {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.render();

    // 清理
    setTimeout(() => {
      if (!this.isOpen) {
        this.dispose();
      }
    }, 1e3);

    this.onDidClose(result);
  }

  public render() {
    if (this.shadowRoot) {
      render(this.active ? this.dialog() : nothing, this.shadowRoot);
    }
  }

  private dialog() {
    const {
      title = '编辑',
      label = '',
      placeholder = '',
      actionText = '保存',
    } = this.options;

    return html`
      <div
        data-theme="${getCurrentTheme()}"
        class="
          fixed inset-0 
          bg-black/25 dark:bg-white/25 backdrop-blur-sm
          flex items-center justify-center p-4
          transition-opacity duration-300 ease-in-out
          ${this.isOpen ? 'opacity-100' : 'opacity-0'}
        "
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) this.close(null);
        }}
        @transitionend=${(e: TransitionEvent) => {
          if (e.propertyName === 'opacity' && !this.isOpen) {
            // 清理
            if (!this.isOpen) {
              this.active = false;
              this.render();
            }
          }
        }}
      >
      <div 
        data-theme="${getCurrentTheme()}"
        class="
          bg-white text-black dark:bg-black dark:text-white rounded-lg shadow-xl w-full max-w-lg
          transform transition-transform duration-300 ease-in-out
          ${this.isOpen ? '' : 'translate-y-10'}
        "
        @click=${(e: Event) => e.stopPropagation()}
        @transitionend=${(e: TransitionEvent) => {
          if (e.propertyName === 'transform' && !this.isOpen) {
            // 对话框关闭动画完成
            this.close(null);
          }
        }}
      >
        <form
          @submit=${(e: Event) => {
            e.preventDefault();
            return this.close(this.value);
          }}
        >
          <div class="border-b px-4 py-3 flex justify-between items-center">
            <h3 class="text-lg font-medium">${title}</h3>
            <button 
              type="button"
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:gray-900 transition-colors"
              @click=${() => this.close(null)}
            >
              <svg 
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
              >
                <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
              </svg>
            </button>
          </div>
          <div class="p-4">
            ${
              label
                ? html`<label
                    for="dialog-input"
                    class="block text-sm font-medium mb-1"
                  >
                    ${label}
                  </label>`
                : nothing
            }
            <input
              id="dialog-input"
              class="
                w-full p-2 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-500 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                focus:outline-none shadow-sm
              "
              type="text"
              .value="${this.value}"
              placeholder="${placeholder}"
              @input="${(e: Event) => {
                this.value = (e.target as HTMLInputElement).value;
              }}"
              autofocus
            />
          </div>
          <div class="border-t px-4 py-3 flex justify-end gap-2">
            <button
              type="button"
              class="
                px-4 py-2 rounded-md text-sm font-medium
                bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors
              "
              @click=${() => this.close(null)}
            >
              取消
            </button>
            <button
              type="submit"
              class="
                px-4 py-2 rounded-md text-sm font-medium text-white 
                bg-blue-600 hover:bg-blue-700 transition-colors
              "
            >
              ${actionText}
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

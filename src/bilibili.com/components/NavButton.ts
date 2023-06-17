import obtainHTMLElementByID from "@/utils/obtainHTMLElementByID";
import { mdiAccountCancelOutline } from "@mdi/js";
import { render, html, nothing } from "lit-html";
import isNonNull from "@/utils/isNonNull";
import style from "../style";
import SettingsDrawer from "./SettingsDrawer";
import blockedUsers from "../models/blockedUsers";

export default class NavButton {
  private readonly settings: SettingsDrawer;

  constructor(settings: SettingsDrawer) {
    this.settings = settings;
  }

  public readonly render = () => {
    const parent = document.querySelector(".right-entry");
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID({
      tag: "li",
      id: "db7a644d-1c6c-4078-a9dc-991b15b68014",
      onDidCreate: (el) => {
        style.apply(el);
        el.classList.add("right-entry-item");
        parent.prepend(...[parent.firstChild, el].filter(isNonNull));
      },
    });
    const count = blockedUsers.distinctID().length;
    render(
      html`
<button
  type="button"
  class="right-entry__outside" 
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.settings.open();
  }}
>
  <svg viewBox="2 2 20 20" class="right-entry-icon h-5 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline}>
  </svg>
  <span class="right-entry-text">
    <span>屏蔽</span>
    ${count > 0 ? html`<span>(${count})</span>` : nothing}
  </span>
</button>
`,
      container
    );
  };
}

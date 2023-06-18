import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import homePageSettings from "../models/homePageSettings";

export default class AdblockTipPatch {
  public readonly render = () => {
    const el = document.querySelector(".adblock-tips");
    if (el instanceof HTMLElement) {
      setHTMLElementDisplayHidden(el, !homePageSettings.allowAdblockTips);
    }
  };
}

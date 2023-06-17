import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import blockedUsers from "../models/blockedUsers";
import parseUserURL from "../utils/parseUserURL";
import VideoHoverButton from "./VideoHoverButton";

// spell-checker: word bili

export default class VideoListPatch {
  public render() {
    document.querySelectorAll<HTMLElement>(".bili-video-card").forEach((i) => {
      const rawURL = i
        .querySelector("a.bili-video-card__info--owner")
        ?.getAttribute("href");
      if (!rawURL) {
        return;
      }
      const user = parseUserURL(rawURL);
      if (!user) {
        return;
      }
      const isBlocked = blockedUsers.has(user.id);
      let container = i;
      while (container.parentElement?.childElementCount === 1) {
        container = container.parentElement;
      }

      setHTMLElementDisplayHidden(container, isBlocked);
      if (!isBlocked) {
        new VideoHoverButton(i.querySelector(".bili-video-card__image--wrap"), {
          id: user.id,
          name:
            i
              .querySelector(".bili-video-card__info--author")
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              ?.getAttribute("title") || user.id,
        }).render();
      }
    });
  }
}

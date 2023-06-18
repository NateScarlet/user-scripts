import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import blockedUsers from "../models/blockedUsers";
import parseUserURL from "../utils/parseUserURL";
import VideoHoverButton from "./VideoHoverButton";
import videoListSettings from "../models/videoListSettings";

// spell-checker: word bili

export default class VideoListPatch {
  public readonly render = () => {
    document.querySelectorAll<HTMLElement>(".bili-video-card").forEach((i) => {
      const rawURL = i
        .querySelector("a.bili-video-card__info--owner")
        ?.getAttribute("href");
      if (!rawURL) {
        return;
      }
      const user = parseUserURL(rawURL);
      let hidden = false;
      if (!user) {
        // assume advertisement
        hidden = !videoListSettings.allowAdvertisement;
      }
      let container = i;
      while (container.parentElement?.childElementCount === 1) {
        container = container.parentElement;
      }

      setHTMLElementDisplayHidden(container, hidden);
      if (user && !hidden) {
        new VideoHoverButton(i.querySelector(".bili-video-card__image--wrap"), {
          id: user.id,
          name:
            i.querySelector(".bili-video-card__info--author")?.textContent ||
            user.id,
        }).render();
      }
    });
  };
}

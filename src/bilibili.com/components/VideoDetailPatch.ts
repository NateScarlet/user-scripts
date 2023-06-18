import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import blockedUsers from "../models/blockedUsers";
import parseUserURL from "../utils/parseUserURL";
import VideoHoverButton from "./VideoHoverButton";
import videoListSettings from "../models/videoListSettings";

// spell-checker: word upname
export default class VideoDetailPatch {
  private readonly blockedTitles = new Set<string>();

  public readonly render = () => {
    document
      .querySelectorAll<HTMLElement>(".video-page-card-small")
      .forEach((i) => {
        const rawURL = i.querySelector(".upname a")?.getAttribute("href");
        if (!rawURL) {
          return;
        }
        const user = parseUserURL(rawURL);

        let hidden = false;
        if (user) {
          const duration =
            i.querySelector(".duration")?.textContent?.trim() ?? "";
          hidden = videoListSettings.shouldExcludeVideo({ user, duration });
        } else {
          // assume advertisement
          hidden = !videoListSettings.allowAdvertisement;
        }

        setHTMLElementDisplayHidden(i, hidden);
        if (user && !hidden) {
          new VideoHoverButton(i.querySelector(".pic-box"), {
            id: user.id,
            name: i.querySelector(".upname .name")?.textContent || user.id,
          }).render();
        }
      });

    document
      .querySelectorAll<HTMLElement>(".bpx-player-ending-related-item")
      .forEach((i) => {
        const title = i.querySelector(
          ".bpx-player-ending-related-item-title"
        )?.textContent;
        if (!title) {
          return;
        }
        const isBlocked = this.blockedTitles.has(title);
        setHTMLElementDisplayHidden(i, isBlocked);
      });
  };
}

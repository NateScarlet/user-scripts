import castPlainObject from '@/utils/castPlainObject';
import evalInContentScope from '@/utils/evalInContentScope';
import getElementSelector from '@/utils/getElementSelector';
import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import blockedUsers from '../models/blockedUsers';
import VideoHoverButton from './VideoHoverButton';

export default class VueVideoRankPatch {
  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.video-card').forEach((i) => {
      const selector = getElementSelector(i);
      const videoData = evalInContentScope(
        `document.querySelector(${JSON.stringify(
          selector
        )}).__vue__._props.videoData`
      );

      const { owner } = castPlainObject(videoData);
      const { mid, name } = castPlainObject(owner);
      if (typeof mid !== 'number' || typeof name !== 'string') {
        return;
      }

      const userID = mid.toString();
      const isBlocked = blockedUsers.has(userID);
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        new VideoHoverButton(i.querySelector('.video-card__content'), {
          id: userID,
          name,
        }).render();
      }
    });
  };
}

import castPlainObject from '@/utils/castPlainObject';
import evalInContentScope from '@/utils/evalInContentScope';
import getElementSelector from '@/utils/getElementSelector';
import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import blockedUsers from '../models/blockedUsers';
import renderVideoHoverButton from './renderVideoHoverButton';

export default class VueVideoRankPatch {
  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.video-card').forEach((i) => {
      const selector = getElementSelector(i);
      const videoData = evalInContentScope(
        `document.querySelector(${JSON.stringify(
          selector
        )}).__vue__._props.videoData`
      );
      // spell-checker: words bvid
      const { owner, title, bvid } = castPlainObject(videoData);
      const { mid, name } = castPlainObject(owner);
      if (typeof mid !== 'number' || typeof name !== 'string') {
        return;
      }

      const userID = mid.toString();
      const isBlocked = blockedUsers.has(userID);
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        const target = i.querySelector('.video-card__content');
        if (target) {
          renderVideoHoverButton(target, {
            id: userID,
            name,
            note:
              (typeof title === 'string' ? title : '') +
              (typeof bvid === 'string' ? `(${bvid})` : ''),
          });
        }
      }
    });
  };
}

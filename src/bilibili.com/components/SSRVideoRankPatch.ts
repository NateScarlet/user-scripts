import setHTMLElementDisplayHidden from '@/utils/setHTMLElementDisplayHidden';
import blockedUsers from '../models/blockedUsers';
import parseUserURL from '../utils/parseUserURL';
import renderVideoHoverButton from './renderVideoHoverButton';

export default class SSRVideoRankPatch {
  public readonly render = () => {
    document.querySelectorAll<HTMLElement>('.rank-item').forEach((i) => {
      const user = parseUserURL(
        i.querySelector('.up-name')?.parentElement?.getAttribute('href')
      );
      if (!user) {
        return;
      }
      const name = i.querySelector('.up-name')?.textContent ?? '';

      const isBlocked = blockedUsers.has(user.id);
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        const target = i.querySelector('.img');
        if (target) {
          renderVideoHoverButton(target, {
            id: user.id,
            name,
            note: '',
          });
        }
      }
    });
  };
}

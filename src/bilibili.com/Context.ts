import Duration, { DurationInput } from '@/utils/Duration';
import ExactSearchMatcher from '@/utils/ExactSearchMatcher';
import videoListSettings from './models/videoListSettings';
import searchSettings from './models/searchSettings';
import blockedUsers from './models/blockedUsers';

export default class Context {
  private readonly m: ExactSearchMatcher;

  public readonly query: string;

  constructor({ query }: { query: string }) {
    this.query = query;
    this.m = new ExactSearchMatcher(query);
  }

  public readonly shouldExcludeVideo = (v: {
    user?: { id: string };
    title: string;
    duration?: DurationInput;
  }): boolean => {
    if (v.user && blockedUsers.has(v.user.id)) {
      return true;
    }

    if (v.duration) {
      const durationMs = Duration.cast(v.duration).toMilliseconds();
      if (durationMs <= 0) {
        // pass
      } else if (
        videoListSettings.durationGte.valid &&
        !(durationMs >= videoListSettings.durationGte.toMilliseconds())
      ) {
        return true;
      } else if (
        videoListSettings.durationLt.valid &&
        !(durationMs < videoListSettings.durationLt.toMilliseconds())
      ) {
        return true;
      }
    }

    if (this.query && v.title && searchSettings.strictTitleMatch) {
      if (!this.m.match(v.title)) {
        return true;
      }
    }

    if (
      v.title &&
      videoListSettings.excludeKeywords.some((i) =>
        v.title.toLowerCase().includes(i.toLowerCase())
      )
    ) {
      return true;
    }

    return false;
  };
}

import Duration, { DurationInput } from '@/utils/Duration';
import ExactSearchMatcher from '@/utils/ExactSearchMatcher';
import videoListSettings from './models/videoListSettings';
import searchSettings from './models/searchSettings';
import blockedUsers from './models/blockedUsers';
import blockedUserPatterns from './models/blockedUserPatterns';
import blockedLiveRooms from './models/blockedLiveRooms';

export default class Context {
  private readonly m: ExactSearchMatcher;

  public readonly query: string;

  constructor({ query }: { query: string }) {
    this.query = query;
    this.m = new ExactSearchMatcher(query);
  }

  public readonly shouldExcludeVideo = (v: {
    user?: { id: string; name?: string };
    title: string;
    duration?: DurationInput;
    isPromoted?: boolean;
  }): boolean => {
    if (v.isPromoted && !videoListSettings.allowPromoted) {
      return true;
    }
    if (v.user) {
      if (blockedUsers.has(v.user.id)) {
        return true;
      }
      if (v.user.name && blockedUserPatterns.shouldBlock(v.user.name)) {
        return true;
      }
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

  public readonly shouldExcludeLiveRoom = (v: {
    room?: { id: string };
    owner?: { id: string };
  }): boolean => {
    if (v.owner && blockedUsers.has(v.owner.id)) {
      return true;
    }
    if (v.room && blockedLiveRooms.has(v.room.id)) {
      return true;
    }
    return false;
  };
}

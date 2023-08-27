import Duration, { DurationInput } from '@/utils/Duration';
import GMValue from '@/utils/GMValue';
import blockedUsers from './blockedUsers';

export default new (class VideoListSettings {
  private readonly value = new GMValue<{
    allowAdvertisement?: boolean;
    durationGte?: string;
    durationLt?: string;
  }>('videoListSettings@4eb93ea9-8748-4647-876f-30451395e561', () => ({}));

  get allowAdvertisement() {
    return this.value.get().allowAdvertisement ?? false;
  }

  set allowAdvertisement(v) {
    this.value.set({
      ...this.value.get(),
      allowAdvertisement: v || undefined,
    });
  }

  get durationGte(): Duration {
    return Duration.parse(this.value.get().durationGte ?? '');
  }

  set durationGte(v: DurationInput) {
    const d = Duration.cast(v);
    if (d.toMilliseconds() >= Duration.HOUR) {
      // value too large may cause infinite load
      this.durationGte = 'PT1M';
      return;
    }
    this.value.set({
      ...this.value.get(),
      durationGte: d.invalid ? undefined : d.toISOString(),
    });
  }

  get durationLt(): Duration {
    const v = Duration.parse(this.value.get().durationLt ?? '');
    if (v.toMilliseconds() <= 10 * Duration.MINUTE) {
      // invalid
      return Duration.parse('');
    }
    return v;
  }

  set durationLt(v: DurationInput) {
    const d = Duration.cast(v);
    if (d.valid && d.toMilliseconds() <= 10 * Duration.MINUTE) {
      // value too small may cause infinite load
      this.durationLt = 'PT30M';
      return;
    }
    this.value.set({
      ...this.value.get(),
      durationLt: d.invalid ? undefined : d.toISOString(),
    });
  }

  public readonly shouldExcludeVideo = (v: {
    user: { id: string };
    duration: DurationInput;
  }) => {
    if (blockedUsers.has(v.user.id)) {
      return true;
    }
    const durationMs = Duration.cast(v.duration).toMilliseconds();
    if (durationMs <= 0) {
      // pass
    } else if (
      this.durationGte.valid &&
      !(durationMs >= this.durationGte.toMilliseconds())
    ) {
      return true;
    } else if (
      this.durationLt.valid &&
      !(durationMs < this.durationLt.toMilliseconds())
    ) {
      return true;
    }
    return false;
  };
})();

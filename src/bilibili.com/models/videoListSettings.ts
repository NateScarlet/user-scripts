import Duration, { DurationInput } from '@/utils/Duration';
import GMValue from '@/utils/GMValue';
import optionalArray from '@/utils/optionalArray';

export default new (class VideoListSettings {
  private readonly value = new GMValue<{
    allowAdvertisement?: boolean;
    durationGte?: string;
    durationLt?: string;
    excludeKeywords?: string[];
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

  get excludeKeywords() {
    return this.value.get().excludeKeywords ?? [];
  }

  set excludeKeywords(v) {
    this.value.set({
      ...this.value.get(),
      excludeKeywords: optionalArray(v.filter((i) => i)),
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
})();

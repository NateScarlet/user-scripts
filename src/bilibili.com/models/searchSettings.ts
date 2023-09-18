import GMValue from '@/utils/GMValue';

export default new (class SearchSettings {
  private readonly value = new GMValue<{
    strictTitleMatch?: boolean;
  }>('searchSettings@aa1595c8-1664-40de-a80c-9de375c2466a', () => ({}));

  get strictTitleMatch() {
    return this.value.get().strictTitleMatch ?? false;
  }

  set strictTitleMatch(v) {
    this.value.set({
      ...this.value.get(),
      strictTitleMatch: v || undefined,
    });
  }
})();

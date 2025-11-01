import GMValue from '@/utils/GMValue';

export default new (class SearchSettings {
  private readonly value = new GMValue<{
    strictTitleMatch?: boolean;
    disableNavSuggestion?: boolean;
    trending?: 'off';
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

  get disableNavSuggestion() {
    return this.value.get().disableNavSuggestion;
  }

  set disableNavSuggestion(v) {
    this.value.set({
      ...this.value.get(),
      disableNavSuggestion: v,
    });
  }

  get trending() {
    return this.value.get().trending ?? 'on';
  }

  set trending(v) {
    this.value.set({
      ...this.value.get(),
      trending: v === 'on' ? undefined : v,
    });
  }
})();

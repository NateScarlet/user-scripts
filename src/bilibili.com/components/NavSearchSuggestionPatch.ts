import searchSettings from '../models/searchSettings';

export default class NavSearchSuggestionPatch {
  private placeholder = '搜索';

  private originalPlaceholder = '';

  render() {
    if (!this.originalPlaceholder && !searchSettings.disableNavSuggestion) {
      // 无需操作
      return;
    }

    const match = document.querySelector('.nav-search-input[placeholder]');
    if (match instanceof HTMLInputElement) {
      if (searchSettings.disableNavSuggestion) {
        if (match.placeholder != this.placeholder) {
          this.originalPlaceholder = match.placeholder;
          match.placeholder = this.placeholder;
          const ob = new MutationObserver(() => {
            if (!searchSettings.disableNavSuggestion) {
              ob.disconnect();
              return;
            }
            if (match.placeholder != this.placeholder) {
              match.placeholder = this.placeholder;
            }
          });
          ob.observe(match, { attributeFilter: ['placeholder'] });
        }
      } else {
        match.placeholder = this.originalPlaceholder;
        this.originalPlaceholder = '';
      }
    }
  }
}

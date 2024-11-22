export default class ExactSearchMatcher {
  private readonly keywords: string[];

  constructor(q: string) {
    this.keywords = q
      .split(/\s/)
      .map((i) => i.trim().toLowerCase())
      .filter((i) => i);
  }

  public readonly match = (...searchKey: string[]): boolean => {
    if (this.keywords.length === 0) {
      return true;
    }
    return this.keywords.every((i) => {
      return searchKey.some((j) => j.toLowerCase().includes(i));
    });
  };
}

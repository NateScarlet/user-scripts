import GMValue from '@/utils/GMValue';

export interface BlockedUserPattern {
  pattern: string;
  blockedAt: number;
}

export default new (class {
  private readonly value = new GMValue<BlockedUserPattern[]>(
    'blockedUserPatterns@206ceed9-b514-4902-ad70-aa621fed5cd4',
    () => []
  );

  public readonly get = () => {
    return this.value.get();
  };

  public readonly subscribe = (
    run: (value: BlockedUserPattern[] | undefined) => void
  ) => {
    return this.value.subscribe(run);
  };

  public set = (patterns: string[]) => {
    this.value.set(
      patterns.map((pattern) => {
        let finalPattern = pattern;
        try {
          new RegExp(pattern);
        } catch {
          finalPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        return {
          pattern: finalPattern,
          blockedAt: Date.now(),
        };
      })
    );
  };

  public shouldBlock = (name: string) => {
    return this.value.get().some((p) => {
      try {
        return new RegExp(p.pattern).test(name);
      } catch {
        return false;
      }
    });
  };
})();

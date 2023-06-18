import GMValue from "@/utils/GMValue";

export default new (class HomePageSettings {
  private readonly value = new GMValue<{
    allowAdblockTips?: boolean;
    floorCard?: {
      excludeAll?: boolean;
      excludeByChannel?: string[];
    };
  }>("homePageSettings@cb2f3e6c-a1e5-44de-b618-7715559b02ad", () => ({}));

  get allowAdblockTips() {
    return this.value.get().allowAdblockTips ?? false;
  }

  set allowAdblockTips(v) {
    this.value.set({
      ...this.value.get(),
      allowAdblockTips: v || undefined,
    });
  }

  public readonly floorCard = new (class {
    constructor(private readonly parent: HomePageSettings) {}

    private get value() {
      return this.parent.value.get().floorCard;
    }

    private set value(v) {
      this.parent.value.set({
        ...this.parent.value.get(),
        floorCard: v,
      });
    }

    get excludeAll() {
      return this.value?.excludeAll;
    }

    set excludeAll(v) {
      this.value = {
        ...this.value,
        excludeAll: v,
      };
    }

    get excludeByChannel(): readonly string[] {
      return this.value?.excludeByChannel ?? [];
    }

    set excludeByChannel(v: Iterable<string>) {
      this.value = {
        ...this.value,
        excludeByChannel: Array.from(new Set(v)).sort(),
      };
    }

    public readonly shouldExclude = (i: { channel: string }): boolean => {
      if (this.excludeAll) {
        return true;
      }
      if (this.excludeByChannel.includes(i.channel)) {
        return true;
      }
      return false;
    };
  })(this);
})();

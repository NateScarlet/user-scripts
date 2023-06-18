import GMValue from "@/utils/GMValue";

export default new (class VideoListSettings {
  private readonly value = new GMValue<{
    allowAdvertisement?: boolean;
  }>("videoListSettings@4eb93ea9-8748-4647-876f-30451395e561", () => ({}));

  get allowAdvertisement() {
    return this.value.get().allowAdvertisement ?? false;
  }

  set allowAdvertisement(v) {
    this.value.set({
      ...this.value.get(),
      allowAdvertisement: v || undefined,
    });
  }
})();

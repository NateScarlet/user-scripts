import Duration, { DurationInput } from "@/utils/Duration";
import GMValue from "@/utils/GMValue";

export default new (class {
  private readonly value = new GMValue(
    "minVideoDuration@206ceed9-b514-4902-ad70-aa621fed5cd",
    () => "P0D"
  );

  public get() {
    return Duration.parse(this.value.get());
  }

  public set(v: DurationInput) {
    this.value.set(Duration.cast(v).toISOString());
  }
})();

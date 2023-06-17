import Duration, { DurationInput } from "@/utils/Duration";
import useGMValue from "@/utils/useGMValue";

const minVideoDuration = useGMValue(
  "minVideoDuration@206ceed9-b514-4902-ad70-aa621fed5cd",
  "P0D"
);

export default new (class {
  get() {
    return Duration.parse(minVideoDuration.value);
  }

  set(v: DurationInput) {
    minVideoDuration.value = Duration.cast(v).toISOString();
  }
})();

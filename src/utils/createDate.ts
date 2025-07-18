import type { DateInput } from './castDate';
import castDate from './castDate';

export interface DateOptions {
  base?: DateInput;
  year?: number;
  yearOffset?: number;
  month?: number;
  monthOffset?: number;
  date?: number;
  dateOffset?: number;
  hours?: number;
  hoursOffset?: number;
  minutes?: number;
  minutesOffset?: number;
  seconds?: number;
  secondsOffset?: number;
  milliseconds?: number;
  millisecondsOffset?: number;
}

export default function createDate({
  base = new Date(),
  year,
  yearOffset,
  month,
  monthOffset,
  date,
  dateOffset,
  hours,
  hoursOffset,
  minutes,
  minutesOffset,
  seconds,
  secondsOffset,
  milliseconds,
  millisecondsOffset,
}: DateOptions = {}): Date {
  const ret = new Date(castDate(base));
  if (year != null) {
    ret.setFullYear(year);
  }
  if (yearOffset) {
    ret.setFullYear(ret.getFullYear() + yearOffset);
  }
  if (month != null) {
    ret.setMonth(month);
  }
  if (monthOffset) {
    ret.setMonth(ret.getMonth() + monthOffset);
  }
  if (date != null) {
    ret.setDate(date);
  }
  if (dateOffset) {
    ret.setDate(ret.getDate() + dateOffset);
  }
  if (hours != null) {
    ret.setHours(hours);
  }
  if (hoursOffset) {
    ret.setHours(ret.getHours() + hoursOffset);
  }
  if (minutes != null) {
    ret.setMinutes(minutes);
  }
  if (minutesOffset) {
    ret.setMinutes(ret.getMinutes() + minutesOffset);
  }
  if (seconds != null) {
    ret.setSeconds(seconds);
  }
  if (secondsOffset) {
    ret.setSeconds(ret.getSeconds() + secondsOffset);
  }
  if (milliseconds != null) {
    ret.setMilliseconds(milliseconds);
  }
  if (millisecondsOffset) {
    ret.setMilliseconds(ret.getMilliseconds() + millisecondsOffset);
  }
  return ret;
}

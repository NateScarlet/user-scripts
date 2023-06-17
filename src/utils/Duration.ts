// port from https://github.com/NateScarlet/iso8601/blob/1f881e261294d70e12d815a85b2995d5d1efbc87/pkg/iso8601/duration.go

import roundDecimal from "./roundDecimal";

function leadingInt(s: string): [x: number, rem: string] {
  let i = 0;
  let x = 0;
  for (; i < s.length; i += 1) {
    const c = s[i]!;
    if (c < "0" || c > "9") {
      break;
    }
    if (x > Number.MAX_SAFE_INTEGER / 10) {
      throw new Error("overflow");
    }

    x = x * 10 + Number.parseInt(c, 10);
    if (x < 0) {
      throw new Error("overflow");
    }
  }
  return [x, s.slice(i)];
}

function leadingNegative(s: string): [boolean, string] {
  if (s === "") {
    return [false, s];
  }
  const c = s[0];
  if (c === "-" || c === "+") {
    return [c === "-", s.slice(1)];
  }
  return [false, s];
}

function leadingFraction(s: string): [x: number, scale: number, rem: string] {
  let x = 0;
  let i = 0;
  let scale = 1;
  let overflow = false;
  for (; i < s.length; i += 1) {
    const c = s[i]!;
    if (c < "0" || c > "9") {
      break;
    }
    if (overflow) {
      continue;
    }
    if (x > Number.MAX_SAFE_INTEGER / 10) {
      // It's possible for overflow to give a positive number, so take care.
      overflow = true;
      continue;
    }
    const y = x * 10 + Number.parseInt(c, 10);
    if (y < 0) {
      overflow = true;
      continue;
    }
    x = y;
    scale *= 10;
  }
  return [x, scale, s.slice(i)];
}

function padLeft(v: string, c: string, n: number): string {
  let ret = v;
  while (ret.length < n) {
    ret = c + ret;
  }
  return ret;
}

function formatSeconds(v: number): string {
  let ret = v.toFixed(3);
  if (ret.indexOf(".") < 2) {
    ret = `0${ret}`;
  }
  return ret;
}
export interface DurationOptions {
  invalid?: boolean;
  negative?: boolean;
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type DurationInput = Duration | DurationOptions | string;

export default class Duration {
  static readonly MILLISECOND = 1;

  static readonly SECOND = 1000;

  static readonly MINUTE = this.SECOND * 60;

  static readonly HOUR = this.MINUTE * 60;

  static readonly DAY = this.HOUR * 24;

  static readonly WEEK = this.DAY * 7;

  static readonly MONTH = (((this.DAY / 10) * 146097) / 4800) * 10;

  static readonly YEAR = this.MONTH * 12;

  public readonly invalid: boolean = false;

  public readonly negative: boolean = false;

  public readonly years: number = 0;

  public readonly months: number = 0;

  public readonly weeks: number = 0;

  public readonly days: number = 0;

  public readonly hours: number = 0;

  public readonly minutes: number = 0;

  public readonly seconds: number = 0;

  public readonly milliseconds: number = 0;

  constructor({
    invalid = false,
    negative = false,
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  }: DurationOptions = {}) {
    this.invalid = invalid;
    this.negative = negative;
    this.years = years;
    this.months = months;
    this.weeks = weeks;
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.milliseconds = milliseconds;
  }

  static fromMilliseconds(milliseconds: number = 0) {
    const d: DurationOptions = {};
    let ms = milliseconds;
    if (ms < 0) {
      d.negative = true;
      ms = -ms;
    }
    d.hours = Math.trunc(ms / Duration.HOUR);
    ms %= Duration.HOUR;
    d.minutes = Math.trunc(ms / Duration.MINUTE);
    ms %= Duration.MINUTE;
    d.seconds = Math.trunc(ms / Duration.SECOND);
    ms %= Duration.SECOND;
    d.milliseconds = ms;
    return new Duration(d);
  }

  static fromTimeCode(value: string) {
    let v = value;
    let sign = 1;
    if (v[0] === "-") {
      v = v.slice(1);
      sign = -1;
    }
    const parts = v.split(/[:：]/);
    parts.splice(0, 0, ...["0", "0"].splice(parts.length - 1));
    const [hours, minutes, seconds] = parts;

    let ret = 0;
    if (hours) {
      ret += parseFloat(hours) * Duration.HOUR;
    }
    if (minutes) {
      ret += parseFloat(minutes) * Duration.MINUTE;
    }
    if (seconds) {
      ret += parseFloat(seconds) * Duration.SECOND;
    }
    ret *= sign;
    return Duration.fromMilliseconds(ret);
  }

  /**
   * @param value iso 8601 duration string
   */
  static parse(value: string): Duration {
    const d = {
      invalid: false,
      negative: false,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    let s = value;
    [d.negative, s] = leadingNegative(s);
    if (s === "" || s[0] !== "P") {
      d.invalid = true;
      return new Duration(d);
    }
    s = s.slice(1);
    let afterT = false;
    while (s) {
      if (s[0] === "T") {
        s = s.slice(1);
        afterT = true;
      }

      let v = 0;
      let f = 0;
      let scale = 1;
      let neg = false;
      let pre = false;
      let post = false;

      [neg, s] = leadingNegative(s);

      // Consume [0-9]*
      const pl = s.length;
      [v, s] = leadingInt(s);

      pre = pl !== s.length; // whether we consumed anything before a period
      if (neg) {
        v = -v;
      }

      // Consume (\.[0-9]*)?
      if (s && s[0] === ".") {
        s = s.slice(1);
        const pl = s.length;
        [f, scale, s] = leadingFraction(s);
        post = pl !== s.length;
        if (neg) {
          f = -f;
        }
      }

      if (!pre && !post) {
        d.invalid = true;
        return new Duration(d);
      }

      const u = s[0];
      s = s.slice(1);
      if (!afterT) {
        switch (u) {
          case "Y":
            d.years += v;
            d.months += f * (Duration.YEAR / Duration.MONTH / scale);
            break;
          case "M":
            d.months += v;
            d.weeks += f * (Duration.MONTH / Duration.WEEK / scale);
            break;
          case "W":
            d.weeks += v;
            d.days += f * (Duration.WEEK / Duration.DAY / scale);
            break;
          case "D":
            d.days += v;
            d.hours += f * (Duration.DAY / Duration.HOUR / scale);
            break;
          default:
            d.invalid = false;
            return new Duration(d);
        }
      } else {
        switch (u) {
          case "H":
            d.hours += v;
            d.minutes += f * (Duration.HOUR / Duration.MINUTE / scale);
            break;
          case "M":
            d.minutes += v;
            d.seconds += f * (Duration.MINUTE / Duration.SECOND / scale);
            break;
          case "S":
            d.seconds += v;
            d.milliseconds +=
              f * (Duration.SECOND / Duration.MILLISECOND / scale);
            break;
          default:
            d.invalid = true;
            return new Duration(d);
        }
      }

      if (post && s !== "") {
        // must end after fraction used.
        d.invalid = true;
        return new Duration(d);
      }
    }
    return new Duration(d);
  }

  static cast(v: DurationInput): Duration {
    if (v instanceof Duration) {
      return v;
    }
    if (typeof v === "string") {
      if (v.includes(":")) {
        return this.fromTimeCode(v);
      } else {
        return this.parse(v);
      }
    }
    return new Duration(v);
  }

  public toISOString(): string {
    if (this.invalid) {
      return "";
    }
    let b = "";
    if (this.negative) {
      b += "-";
    }
    b += "P";
    const prefixWidth = b.length;
    // Y
    if (this.years) {
      b = this.years.toString();
      b += "Y";
    }
    // M
    if (this.months) {
      b = this.months.toString();
      b += "M";
    }
    // W
    if (this.weeks) {
      b = this.weeks.toString();
      b += "W";
    }
    // D
    if (this.days) {
      b += this.days.toString();
      b += "D";
    }
    // T
    if (this.hours || this.minutes || this.seconds || this.milliseconds) {
      b += "T";
    }
    // H
    if (this.hours) {
      b += this.hours.toString();
      b += "H";
    }
    // M
    if (this.minutes) {
      b += this.minutes.toString();
      b += "M";
    }
    // S
    if (this.seconds || this.milliseconds) {
      b += roundDecimal(
        this.seconds + this.milliseconds / Duration.SECOND,
        3
      ).toString();
      b += "S";
    }
    if (b.length === prefixWidth) {
      b += "0D";
    }
    return b;
  }

  public toMilliseconds(): number {
    if (this.invalid) {
      return NaN;
    }
    return (
      (this.negative ? -1 : 1) *
      (this.years * Duration.YEAR +
        this.months * Duration.MONTH +
        this.weeks * Duration.WEEK +
        this.days * Duration.DAY +
        this.hours * Duration.HOUR +
        this.minutes * Duration.MINUTE +
        this.seconds * Duration.SECOND +
        this.milliseconds * Duration.MILLISECOND)
    );
  }

  public toHours(): number {
    return this.toMilliseconds() / Duration.HOUR;
  }

  public toString(): string {
    if (this.invalid) {
      return "Invalid Duration";
    }
    return this.toISOString();
  }

  /**
   * Format duration to `HH:MM:SS.sss` format
   */
  toTimeCode(fixed = false): string {
    let v = this.toMilliseconds();
    let sign = "";
    if (v < 0) {
      sign = "-";
      v = -v;
    }
    v /= 1e3;
    const seconds = v % 60;
    v = Math.trunc(v / 60);
    const minutes = v % 60;
    v = Math.trunc(v / 60);
    const hours = v;

    let ret = `${padLeft(hours.toFixed(0), "0", 2)}:${padLeft(
      minutes.toFixed(0),
      "0",
      2
    )}:${formatSeconds(seconds)}`;
    if (!fixed) {
      if (ret[0] === "0" && ret[1] !== ":") {
        ret = ret.slice(1);
      }
      ret = ret.replace(/\.?0+$/, "");
    }
    ret = sign + ret;
    return ret;
  }

  add(other: DurationInput): Duration {
    return Duration.fromMilliseconds(
      this.toMilliseconds() + Duration.cast(other).toMilliseconds()
    );
  }

  sub(other: DurationInput): Duration {
    return Duration.fromMilliseconds(
      this.toMilliseconds() - Duration.cast(other).toMilliseconds()
    );
  }

  abs(): Duration {
    return Duration.fromMilliseconds(Math.abs(this.toMilliseconds()));
  }

  isZero(): boolean {
    return this.toMilliseconds() === 0;
  }

  truncate(unitMs: number): Duration {
    if (unitMs <= 0) {
      return this;
    }
    const ms = this.toMilliseconds();
    return Duration.fromMilliseconds(ms - (ms % unitMs));
  }
}

export type DateInput = Date | number | string;

export default function castDate(v: DateInput): Date {
  if (v instanceof Date) {
    return v;
  }
  return new Date(v);
}

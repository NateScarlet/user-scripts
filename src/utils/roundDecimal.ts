export default function roundDecimal(v: number, decimalPlaces: number) {
  const factor = 10 ** decimalPlaces;
  // https://stackoverflow.com/a/11832950
  return Math.round(v * factor + Number.EPSILON) / factor;
}

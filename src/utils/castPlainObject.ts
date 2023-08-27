import { isPlainObject } from 'lodash-es';

export default function castPlainObject(
  value: unknown
): Record<string | number | symbol, unknown> {
  if (isPlainObject(value)) {
    return value as Record<string | number | symbol, unknown>;
  }
  return { value };
}

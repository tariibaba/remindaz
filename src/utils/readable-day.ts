import { ReadableDays } from '../types';

export function getString(readableSecond: ReadableDays): string {
  const { num, unit } = readableSecond;
  return `${num} ${unit}${num === 1 ? '' : 's'}`;
}

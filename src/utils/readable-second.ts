import { ReadableSeconds } from '../types';

export function getSeconds(time: ReadableSeconds): number {
  let result: number = 0;
  if (time.unit === 'minute') {
    result = time.num * 60;
  } else if (time.unit === 'hour') {
    result = time.num * 60 * 60;
  }
  return result;
}

export function getString(readableSecond: ReadableSeconds): string {
  const { num, unit } = readableSecond;
  return `${num} ${unit}${num === 1 ? '' : 's'}`;
}

export default getSeconds;

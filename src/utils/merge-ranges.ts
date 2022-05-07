export default function mergeRanges(
  ranges: [number, number][]
): [number, number][] {
  if (ranges.length < 2) return [...ranges];

  ranges = ranges.sort((item1, item2) => item1[0] - item2[0]);
  const merged: [number, number][] = [];
  let currStart: number = ranges[0][0];
  let currEnd: number = ranges[0][1];
  for (let i = 0; i < ranges.length - 1; i++) {
    const next = ranges[i + 1];
    const nextStart = next[0];
    if (nextStart > currEnd) {
      merged.push([currStart, currEnd]);
      currStart = next[0];
    }
    currEnd = next[1];
  }
  merged.push([currStart, currEnd]);
  return merged;
}

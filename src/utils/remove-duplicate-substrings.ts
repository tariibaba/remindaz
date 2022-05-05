export default function removeDuplicateSubstrings(strs: string[]): string[] {
  const distinct: string[] = [];
  for (let i = 0; i < strs.length; i++) {
    let isDistinct = true;
    const str = strs[i];
    for (let j = i + 1; j < strs.length; j++) {
      if (strs[j].search(str) !== -1) {
        isDistinct = false;
        break;
      }
    }
    if (isDistinct && !distinct.find((value) => value.search(str) !== -1)) {
      distinct.push(str);
    }
  }
  return distinct;
}

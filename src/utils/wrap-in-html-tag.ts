export type HTMLWrapOptions = {
  text: string;
  ranges: [number, number][];
  startTag: string;
  endTag: string;
};

export default function wrapInHtmlTag(options: HTMLWrapOptions): string {
  const { text: str, ranges, startTag, endTag } = options;
  let html = '';
  let spanIndex = 0;
  for (let i = 0; i < str.length; i++) {
    const [spanStart, spanEnd] = ranges[spanIndex];
    if (i === spanStart) {
      html += startTag;
    }
    if (i === spanEnd) {
      html += endTag;
      spanIndex++;
    }
    html += str[i];
    if (spanIndex === ranges.length) {
      html += str.slice(i + 1);
      break;
    }
  }
  return html;
}

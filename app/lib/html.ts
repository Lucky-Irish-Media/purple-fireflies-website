// Utilities for normalizing HTML produced by the Quill rich text editor so it
// renders correctly outside of the editor (e.g. in emails and public pages).
//
// Quill stores lists in a single <ol> where each <li> carries a `data-list`
// attribute ("bullet", "ordered", "checked", ...) and an optional
// `ql-indent-N` class for nesting. Browsers render that flat <ol> as a
// numbered list, so unordered bullets show up as ordered. This converts the
// flat markup into proper nested <ul>/<ol> structures.

type QuillListItem = {
  type: string;
  indent: number;
  content: string;
};

function getListType(type: string): [string, string] {
  const tag = type === "ordered" ? "ol" : "ul";
  switch (type) {
    case "checked":
      return [tag, ' data-list="checked"'];
    case "unchecked":
      return [tag, ' data-list="unchecked"'];
    default:
      return [tag, ""];
  }
}

function convertListHTML(items: QuillListItem[], lastIndent: number, types: string[]): string {
  if (items.length === 0) {
    const popped = types.pop() || "bullet";
    const [endTag] = getListType(popped);
    if (lastIndent <= 0) {
      return `</li></${endTag}>`;
    }
    return `</li></${endTag}>${convertListHTML([], lastIndent - 1, types)}`;
  }

  const [first, ...rest] = items;
  const [tag, attribute] = getListType(first.type);

  if (first.indent > lastIndent) {
    types.push(first.type);
    if (first.indent === lastIndent + 1) {
      return `<${tag}><li${attribute}>${first.content}${convertListHTML(rest, first.indent, types)}`;
    }
    return `<${tag}><li>${convertListHTML(items, lastIndent + 1, types)}`;
  }

  const previousType = types[types.length - 1];
  if (first.indent === lastIndent && first.type === previousType) {
    return `</li><li${attribute}>${first.content}${convertListHTML(rest, first.indent, types)}`;
  }

  const popped = types.pop() || first.type;
  const [endTag] = getListType(popped);
  return `</li></${endTag}>${convertListHTML(items, lastIndent - 1, types)}`;
}

export function normalizeQuillLists(html: string): string {
  if (!html || !html.includes("data-list")) return html;

  return html.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (match, inner) => {
    if (!inner.includes("data-list")) return match;

    const items: QuillListItem[] = [];
    const liRegex = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
    let m: RegExpExecArray | null;
    while ((m = liRegex.exec(inner)) !== null) {
      const attrs = m[1] || "";
      let content = m[2] || "";
      // Strip Quill's UI helper span that only makes sense inside the editor.
      content = content.replace(/<span\b[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*>\s*<\/span>/gi, "");
      content = content.replace(/<span\b[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*><\/span>/gi, "");

      const dl = attrs.match(/data-list=["']?(\w+)["']?/i);
      const type = dl ? dl[1] : "bullet";

      const cls = attrs.match(/class=["']([^"']*)["']/i);
      let indent = 0;
      if (cls) {
        const im = cls[1].match(/ql-indent-(\d+)/);
        if (im) indent = parseInt(im[1], 10);
      }

      items.push({ type, indent, content });
    }

    if (items.length === 0) return match;
    return convertListHTML(items, -1, []);
  });
}

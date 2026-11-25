// Splits a Markdown file into its front matter (the `---` block at the top) and its body.
// Supports the simple `key: value` lines posts use; `tags` may be `[a, b]` or `a, b`.
export function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim().replace(/^["'](.*)["']$/, "$1");
    if (m[1] === "tags") value = value.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    data[m[1]] = value;
  }
  return { data, body: text.slice(match[0].length) };
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontMatter } from "./frontmatter.js";

test("reads title, date, tags in both forms, and an optional cover", () => {
  const a = parseFrontMatter('---\ntitle: "Hello: world"\ndate: 2026-11-25\ntags: [cars, music]\ncover: /cool/a.jpg\n---\n# Body\n');
  assert.deepEqual(a.data, { title: "Hello: world", date: "2026-11-25", tags: ["cars", "music"], cover: "/cool/a.jpg" });
  assert.equal(a.body, "# Body\n");
  assert.deepEqual(parseFrontMatter("---\ntags: poker, 'league'\n---\nx").data.tags, ["poker", "league"]);
});

test("a file without front matter is all body", () => {
  assert.deepEqual(parseFrontMatter("just text"), { data: {}, body: "just text" });
});

test("Windows line endings work", () => {
  assert.equal(parseFrontMatter("---\r\ntitle: Hi\r\n---\r\nbody").data.title, "Hi");
});

// Cool Stuff: every .md file in /content/cool is a post. They're bundled at build time; drop in a file and rebuild.
import "./site.js";
import { marked } from "marked";
import { parseFrontMatter } from "./frontmatter.js";

const files = import.meta.glob("/content/cool/*.md", { query: "?raw", import: "default", eager: true });
const posts = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontMatter(raw);
    return { slug: path.split("/").pop().replace(/\.md$/, ""), title: data.title ?? "Untitled", date: data.date ?? "", tags: data.tags ?? [], cover: data.cover, body };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const fmt = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : "");
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const tags = (t) => `<span class="tags">${t.map((x) => `<span>${esc(x)}</span>`).join("")}</span>`;

const list = document.getElementById("posts");
if (list) {
  list.innerHTML = posts.map((p) => `
    <li class="row">
      <p class="when"><time datetime="${esc(p.date)}">${fmt(p.date)}</time></p>
      <div><h3><a href="/cool/${p.slug}">${esc(p.title)}</a></h3>${tags(p.tags)}</div>
    </li>`).join("") || `<li class="row"><p class="when"></p><p class="muted">Nothing here yet.</p></li>`;
}

const article = document.getElementById("post");
if (article) {
  const slug = location.pathname.split("/").filter(Boolean).pop();
  const p = posts.find((x) => x.slug === slug);
  if (!p) {
    article.insertAdjacentHTML("beforeend", `<h1>this post wandered off</h1>`);
  } else {
    document.title = `${p.title} · Daniel Su`;
    // Posts are written by the site owner and bundled at build time, so their Markdown is trusted.
    article.insertAdjacentHTML("beforeend", `
      <header class="post-head">
        <h1>${esc(p.title)}</h1>
        <p class="muted"><time datetime="${esc(p.date)}">${fmt(p.date)}</time> ${tags(p.tags)}</p>
      </header>
      ${p.cover ? `<img class="cover" src="${esc(p.cover)}" alt="">` : ""}
      <div class="prose">${marked.parse(p.body)}</div>`);
  }
}

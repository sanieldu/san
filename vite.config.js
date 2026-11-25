import { defineConfig } from "vite";
import { existsSync, readFileSync } from "node:fs";

const pages = ["index", "about", "experience", "projects", "cool", "post", "404"];
const partial = (name) => readFileSync(`partials/${name}.html`, "utf8");
const SITE = "https://heydsu.com";

// Shared <head> tags, header and footer go into every page at build time, so the output is plain static HTML.
function site() {
  return {
    name: "site",
    transformIndexHtml(html, ctx) {
      const page = ctx.path.replace(/^\//, "").replace(/\.html$/, "") || "index";
      const title = html.match(/<title>(.*?)<\/title>/)[1];
      const description = html.match(/<meta name="description" content="(.*?)">/)[1];
      const head = partial("head")
        .replaceAll("%TITLE%", title)
        .replaceAll("%DESCRIPTION%", description)
        .replaceAll("%URL%", SITE + (page === "index" ? "/" : `/${page}`));
      const header = partial("header").replace(`href="/${page}"`, `href="/${page}" aria-current="page"`);
      return html.replace("</head>", head + "</head>").replace("<!-- header -->", header).replace("<!-- footer -->", partial("footer"));
    },
  };
}

// Clean URLs in dev and preview, the way vercel.json serves them in production.
function cleanUrls(server) {
  server.middlewares.use((req, _res, next) => {
    const [path, query = ""] = req.url.split("?");
    if (/^\/cool\/[^/.]+$/.test(path)) req.url = "/post.html" + (query && "?" + query);
    else if (path !== "/" && !path.includes(".") && existsSync(`.${path}.html`)) req.url = `${path}.html` + (query && "?" + query);
    next();
  });
}

export default defineConfig({
  plugins: [site(), { name: "clean-urls", configureServer: cleanUrls, configurePreviewServer: cleanUrls }],
  // The dachshund chunk (three.js) is large but only loads when someone finds him.
  build: { rollupOptions: { input: pages.map((p) => `${p}.html`) }, chunkSizeWarningLimit: 600 },
});

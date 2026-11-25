# heydsu.com

Daniel Su's personal site. Vite + plain JavaScript; every page is a plain HTML file.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/ (Vercel runs this automatically)
npm test         # checks the Cool Stuff front-matter parser
```

## Where things go

| What | Where |
|---|---|
| Trumpet lick for the intro | `public/audio/lick.mp3` (the current file is a synthesized placeholder) |
| Resume PDF | `public/resume.pdf` (the current file is a placeholder page) |
| A Cool Stuff post | a new `.md` file in `content/cool/` (see `how-to-add-a-post.md`) |
| Post cover images | `public/cool/`, referenced as `/cool/name.jpg` |
| Shared header / footer / meta tags | `partials/` |
| The intro's reveal ("notes become the menu") | `src/reveal.js`, swappable on its own |

To show the intro again to everyone (e.g. after changing the lick), bump `FLAG` in `src/home.js`
and the matching key in the inline script in `index.html`.

Search engines are blocked (`noindex` in `partials/head.html` and an `X-Robots-Tag` header in `vercel.json`)
until launch.

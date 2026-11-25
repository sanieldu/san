---
title: How to add a post here
date: 2026-11-25
tags: [meta, how-to]
---

Every post on this page is one Markdown file in the `content/cool/` folder of the repo. To add one:

1. Create a new file in `content/cool/`, for example `timberwolves-2026.md`. The file name becomes the link: `heydsu.com/cool/timberwolves-2026`.
2. Start it with a front matter block like this:

```
---
title: Why the Timberwolves are my team
date: 2026-12-01
tags: [basketball, timberwolves]
cover: /cool/wolves.jpg
---
```

3. Write the post under it in plain Markdown: paragraphs, **bold**, *italics*, lists, [links](https://heydsu.com) and images.
4. Commit and push. Vercel rebuilds the site and the post shows up at the top of the list (newest date first).

`cover` is optional. To use one, put the image in `public/cool/` and point to it as `/cool/your-image.jpg`.

You can do all of this on github.com: open the `content/cool` folder, click **Add file → Create new file**, and paste the template above.

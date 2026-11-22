# ResizePhotoInKB — exam photo & signature tools

Live domain: https://www.resizephotoinkb.com

Next.js 15 + TypeScript + Tailwind. Every page is static HTML (SSG). All image processing runs in the browser.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your domain.

## Where things live

| What | File |
|---|---|
| Site name, domain, contact email | `src/lib/site.ts` |
| Exam requirements (one entry per exam = one page) | `src/lib/exams.ts` |
| Tool list / compress sizes | `src/lib/tools.ts` |
| Blog posts (Markdown + front matter) | `content/blog/*.md` |
| Image engine (resize, KB targeting, padding, DPI) | `src/lib/image.ts` |

**Add an exam:** add an object to `exams` in `src/lib/exams.ts`. The exam page, presets, sitemap, footer and home page update automatically.

**Add a blog post:** create `content/blog/my-post-slug.md` with `title`, `description`, `date`, `category`, `tags` in the front matter.

## Before applying for AdSense

1. Buy a domain, deploy (Vercel works out of the box), set `NEXT_PUBLIC_SITE_URL`.
2. Change `name` and `contactEmail` in `src/lib/site.ts` (use an email on your own domain).
3. Re-check every exam in `src/lib/exams.ts` against the official notification and update `lastChecked`.
4. Grow the blog to roughly 15–25 original, useful posts.
5. Add the site to Google Search Console, submit `/sitemap.xml`, wait until pages are indexed.
6. Apply for AdSense. When you get the publisher ID, set `NEXT_PUBLIC_ADSENSE_CLIENT` — the AdSense script, the `google-adsense-account` meta tag and `/ads.txt` are generated from it.
7. Visitors from the EEA/UK need a Google-certified consent banner (set it up under AdSense → Privacy & messaging).

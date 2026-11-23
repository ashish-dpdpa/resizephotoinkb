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
| Guides: evergreen how-tos (Markdown + front matter) | `content/guides/*.md` → `/guides` |
| Blog: news and updates, written in the admin panel | Supabase table `posts` → `/blog` |
| Admin panel | `/admin` (`src/app/admin/`) |
| Database schema, security rules, image bucket | `supabase/schema.sql` |
| Image engine (resize, KB targeting, padding, DPI) | `src/lib/image.ts` |

**Add an exam:** add an object to `exams` in `src/lib/exams.ts`. The exam page, presets, sitemap, footer and home page update automatically.

**Add a guide:** create `content/guides/my-guide-slug.md` with `title`, `description`, `date`, `category`, `tags` in the front matter.

**Write a blog post:** sign in at `/admin`, click **New post**, write in Markdown, then **Publish** (or set a future date to schedule it). Pasting or dropping an image into the editor uploads it.

## Blog and admin setup (Supabase)

1. In `.env` (or `.env.local`), set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (Supabase → Connect → Session pooler), `ADMIN_EMAIL` and `ADMIN_PASSWORD`. See `.env.example`.
2. Run `npm run db:setup`. It applies `supabase/schema.sql` (the `posts` and `admins` tables, row-level security rules, `blog-images` bucket) and creates the admin login. It's safe to re-run.
3. Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Recommended: in Supabase, go to **Authentication → Sign In / Providers** and turn off "Allow new users to sign up". Strangers couldn't post anyway (only users in `admins` can), but there's no reason to let them create accounts.

**Changing the admin login:** edit `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` and restart the server. On every start, the server syncs those values into Supabase (`src/instrumentation.ts`). To apply a change without restarting, run `npm run admin:sync`. A new password signs out existing sessions, and a new email renames the same admin account. In production, set `DATABASE_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your host's env settings too. A redeploy then applies the change.

Until Supabase is set up, `/blog` shows a "coming soon" card and `/admin` shows these steps. Published posts appear right away (saving refreshes the cached pages); scheduled posts appear within about 5 minutes of their publish time. The 11 guides that used to live at `/blog/<slug>` 301-redirect to `/guides/<slug>` (list in `next.config.ts`).

## Before applying for AdSense

1. Buy a domain, deploy (Vercel works out of the box), set `NEXT_PUBLIC_SITE_URL`.
2. Change `name` and `contactEmail` in `src/lib/site.ts` (use an email on your own domain).
3. Re-check every exam in `src/lib/exams.ts` against the official notification and update `lastChecked`.
4. Grow the blog to roughly 15–25 original, useful posts.
5. Add the site to Google Search Console, submit `/sitemap.xml`, wait until pages are indexed.
6. Apply for AdSense. When you get the publisher ID, set `NEXT_PUBLIC_ADSENSE_CLIENT` — the AdSense script, the `google-adsense-account` meta tag and `/ads.txt` are generated from it.
7. Visitors from the EEA/UK need a Google-certified consent banner (set it up under AdSense → Privacy & messaging).

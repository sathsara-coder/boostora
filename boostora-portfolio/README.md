# Sathsara Yoshith × Boostora LK — Premium Portfolio CMS

A complete source-code project for a futuristic personal portfolio and the **Boostora LK** business site, with real Supabase-backed editing at `/admin`. The visual language uses dark glassmorphism, animated glossy capsules, scroll motion, and blue/violet accents. Content is initially seeded into PostgreSQL and is editable from the dashboard — you do not have to change source code when adding new work or editing text.

**Important:** The downloadable project is **not a hosted website**. To use real authentication, uploads, form submissions and publishing, you must create a Supabase project and deploy the Next.js application (for example, to Vercel). No database credentials or third-party accounts have been connected on your behalf.

## Included

- Fully responsive pages: `/`, `/about`, `/portfolio`, `/services`, `/boostora`, `/contact`
- Cinematic hero, gradient typography, animated capsule art, hover/magnetic buttons, GSAP ScrollTrigger reveals/parallax, mobile navigation and reduced-motion support
- Real WhatsApp contact integration for **+94 77 668 3130** with the requested prefilled message; click-to-call and configurable email/Facebook/Instagram
- Portfolio category filters, project detail gallery modal with playable MP4/WebM previews
- Real enquiry form at `/api/contact`; incoming messages saved into the database and visible in `/admin`
- Password-based admin sign-in **plus a separate SQL allowlist**, enforced using PostgreSQL RLS
- Edit hero/about/services/testimonials/Boostora contacts/SEO/colour palette/fonts/animation intensity
- Upload images, video or PDF to Supabase Storage; media library, project multi-asset galleries, delete/reorder, drag-and-drop upload
- Separate saved drafts and public published versions; protected `/preview` and atomic **Publish** operation
- Sitemap and robots metadata; no invented social links, testimonials or projects

## 1. Install prerequisites

Install Node.js 20.9+ (22 LTS recommended). Have a Supabase account and, for deployment, a Vercel or other Next.js hosting account.

## 2. Create the Supabase project

1. Visit https://supabase.com/dashboard and create a new project.
2. Open **SQL Editor**. Copy and execute `supabase/schema.sql` (fresh project only).
3. Copy and execute `supabase/002_seed.sql` (initial site content).
4. In **Authentication → Users**, create/invite your own administrator email and choose a strong password. Confirm the account if required by your Supabase email confirmation settings.
5. In **SQL Editor**, run the following, replacing the sample address with **your actual admin account email**:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR_REAL_ADMIN_EMAIL@example.com'
on conflict (user_id) do nothing;
```

6. In **Authentication → Providers → Email**, disable public self-registration if you do not need it. Enable MFA and appropriate rate limits where available. Admin authorization is still separately enforced by the `admin_users` table.
7. Confirm the `website-media` bucket exists in **Storage**. The schema creates it automatically.

**Never put the Supabase service-role or secret key in a `NEXT_PUBLIC_` variable.** This project needs only the **publishable/anon key**. Supabase RLS rules enforce what each user can do.

## 3. Configure and run

From the project folder:

```bash
npm install
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if preferred.

Edit `.env.local` with your own values from **Supabase → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin` for the editor. Sign in with the Supabase user from step 2.

## 4. Editing workflow (no code needed)

1. Open `/admin` and sign in.
2. **Homepage:** change hero text, upload a portrait or background image.
3. **About me:** change name, biography and skills, add achievements, upload CV.
4. **Portfolio:** add a real project, upload multiple photos or videos, choose its cover and category; use drag-and-drop or arrow buttons to order projects. Save project draft.
5. **Services / Testimonials / Boostora LK:** edit entries and contact details.
6. **Appearance:** change colours, typeface and animation settings.
7. **Save draft** to keep the work private. **Preview** opens the draft version in a new tab visible only to authorized admins.
8. **Publish** atomically updates public site content and all project records. Projects marked for deletion are removed when you publish.
9. **Enquiries:** read submitted messages, change status or reply using your email app.

Text, projects, media records, contact enquiries, and draft/published content persist in **Supabase PostgreSQL + Storage**. Uploading media stores real files, not placeholder metadata.

## 5. Deployment (Vercel example)

1. Push the folder to **your private GitHub repository** (without `.env.local`).
2. Import the repository from https://vercel.com/new, select Next.js, and add the same three environment variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your actual public HTTPS domain and redeploy.
4. If you use any Supabase email links or password resets, set the **Site URL** and allowed redirect URLs under Supabase Authentication → URL Configuration.
5. Test the published site and `/admin` on desktop and phone, including image/video uploads, contact submission, WhatsApp opening and Preview → Publish.

## 6. Important production notes

- **Public media:** Supabase bucket is intentionally public to show portfolio images and videos to visitors. An unlisted draft upload can still be opened by anyone who knows its public URL. Do not upload confidential client material here.
- **File limit:** uploads are limited to 50 MB per file (matching the supplied Storage bucket setup). Compress videos or adjust the project's Storage plan/configuration for large files.
- **Spam protection:** the contact form has form validation, a honeypot and an origin check, but high-traffic production sites should add server-side/IP rate limiting and optionally Turnstile.
- **Public self-signup:** there is no signup form. Supabase authentication plus an allowlisted admin user and RLS protect edits. Use a strong password, and enable MFA where possible.
- **Media removal:** deletion is blocked in the editor if a file is referenced by a saved draft or published page. First remove it from content, save/publish, and then remove the asset.
- **SEO:** site title/description are database driven, pages are server rendered, and sitemap/robots are generated. Search-engine indexing takes time after deployment.
- **No imaginary social identities:** Facebook URL, Instagram URL and email start blank. Once entered in the dashboard and published, they appear automatically.
- **No fake testimonials:** the site only renders ones you add.

## Folder overview

```
app/
  page.tsx              Homepage, SSR public content
  [slug]/page.tsx       About, portfolio, services, Boostora, contact
  admin/page.tsx        Full no-code admin dashboard
  preview/page.tsx      Private draft preview
  api/contact/route.ts  Validated enquiry endpoint
  globals.css           Public creative design system
  admin.css             Admin dashboard styles
components/PublicSite.tsx
lib/{content,supabase,types}.ts
supabase/{schema,002_seed}.sql
```

## Suggested launch checklist

- [ ] Supabase configured and seeded
- [ ] Administrator allowlisted and signed in
- [ ] Profile portrait uploaded
- [ ] Portfolio projects uploaded, saved and published
- [ ] Real business logo uploaded
- [ ] Facebook/Instagram/email entered if available
- [ ] Contact enquiry tested and seen in dashboard
- [ ] WhatsApp + call buttons tested on mobile
- [ ] Custom domain set and HTTPS active
- [ ] Privacy policy and any consent notices added as required for your market

**Business contact used in the seed:** Boostora LK — +94 77 668 3130 — Sri Lanka.

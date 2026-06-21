# MBA & Scholarship Tracker · 2027 intake

A clean, single-page web app that tracks MBA applications, scholarships, essays,
and deadlines for the **2027 intake** — built around a Chevening-core UK plan
with India loan-scholarship backups. It's a **personal, single-user, offline**
tool: everything is pre-seeded and all your edits are saved in the browser
(`localStorage`). No backend, no login, no data leaves your machine.

> Pre-loaded for **B. Jyothi Swaroop** — goal: a 1-year MBA for 2027 →
> senior marketing / CMO role in India, largely funded via scholarships +
> low/zero-interest loan-scholarships.

---

## Features

- **Dashboard** — next 3 deadlines with live countdowns (colour-coded:
  🔴 < 30 days, 🟠 < 90 days, 🟢 otherwise), an overall progress bar, per-school
  status chips, a "due this month" list, and an application-status donut.
- **Schools** — a card per school: programme, tuition, **Chevening funding gap**,
  GMAT/waiver policy, application rounds, and every scholarship with an
  **Automatic / Separate application** badge. *Separate-application* scholarships
  (the ones you must not miss) are flagged loudly in red.
- **Scholarships** — two groups: school scholarships and India loan-scholarships,
  each with amount, deadline/window, apply-type, eligibility, and status. Filter
  to just the must-not-miss separate applications.
- **Timeline** — every milestone from **June 2026 → September 2027** (Chevening +
  school rounds + loan-scholarship windows + GMAT), grouped by month, with
  checkboxes and past-due highlighting.
- **Essays** — a board grouped by status (Not started / In progress / Submitted)
  so you can reuse drafts across apps.
- **Tasks & Recommenders** — a checklist plus recommender status.
- Inline status dropdowns everywhere; **add / edit / delete** items where it makes
  sense. Every change persists immediately.
- **Export / Import JSON** to back up & restore, and **Reset to seed data**.
- Responsive (works well on a phone) with an optional **light / dark** toggle.
- Dates marked `~ verify` are approximate — confirm them on the official sites.

---

## Run locally

Requires **Node 18+** (Node 20/22 recommended).

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>).

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
npm run lint      # type-check only (tsc --noEmit)
```

---

## Editing the seed data

All the seed content lives in one file: [`src/data.ts`](src/data.ts).
Edit the arrays inside `buildSeed()` (schools, scholarships, milestones, essays,
tasks, recommenders) and the app will pick them up. To discard your saved edits
and reload the new seed, click **Reset** in the header (or clear the
`mba-tracker:v1` key from `localStorage`).

---

## Deploy

The app is a static site (`base: './'` in `vite.config.ts` keeps asset paths
relative, so the same build works on a root domain *or* a sub-path).

### Vercel (easiest)

1. Push this folder to a GitHub repo.
2. In Vercel → **New Project** → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Deploy. (Vercel auto-detects all of this — just click through.)

Or from the CLI:

```bash
npm i -g vercel
vercel        # follow the prompts; accept the Vite defaults
vercel --prod
```

### GitHub Pages

```bash
npm run build          # produces dist/
npx gh-pages -d dist   # publishes dist/ to the gh-pages branch
```

Then in your repo: **Settings → Pages → Branch: `gh-pages` / root**.
Because `base` is relative, no further config is needed for a project page
(`https://<user>.github.io/<repo>/`).

> Tip: GitHub Pages may serve a Jekyll-processed site. The included build is
> plain static assets, so add an empty `.nojekyll` file to `dist` before
> publishing if you hit 404s on hashed asset filenames:
> `touch dist/.nojekyll && npx gh-pages -d dist --dotfiles`.

---

## Tech

React 18 · Vite · TypeScript · Tailwind CSS · lucide-react · recharts.
No backend — state persists in `localStorage` under the key `mba-tracker:v1`
(theme under `mba-tracker:theme`).

## Privacy

100% local. Nothing is uploaded anywhere. Use **Export** regularly to keep a
JSON backup (e.g. in your Drive), since clearing browser data will wipe the
`localStorage` copy.

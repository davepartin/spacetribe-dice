# Fleet Dice Online

Phone-ready home, solo, and two-player Fleet Dice — hosted on **GitHub Pages**.

Players never sign in with OpenAI or ChatGPT. Versus uses Firebase Anonymous
Auth in the browser only (no password, no account to create).

## Play

After Pages is enabled, the public site is:

**https://davepartin.github.io/spacetribe-dice/**

| Route | What it does |
| --- | --- |
| `/` | Choose Solo, create Versus, or enter a four-digit code |
| `/solo/` | Complete v82 solo game |
| `/versus/` | Create a private two-player room |
| `/join/?id=…` | Accept an invite link |
| `/match/?id=…` | Play a synchronized match |

## Local development

Requires Node.js `>=22.13.0` and pnpm.

```bash
cd web
pnpm install
pnpm dev
```

Open `http://localhost:3000/spacetribe-dice/` (the app uses that base path so
local links match GitHub Pages).

For a root-path local server:

```bash
BASE_PATH= pnpm dev
```

```bash
pnpm build
pnpm test
```

Default Firebase config points at the `space-tribes` project. Override with
`NEXT_PUBLIC_FIREBASE_*` if needed (see `.env.example`).

## Firebase (multiplayer only)

Cloud Firestore stores private rooms. `firestore.rules` must stay deployed.

```bash
cd web
npx -y firebase-tools@latest deploy --only firestore:rules --project space-tribes
```

After the site goes live, add **`davepartin.github.io`** under Firebase Console →
Authentication → Settings → Authorized domains (if it is not already listed).

## Deploy

Pushing to `main` runs `.github/workflows/deploy-web.yml`, which builds the
static export from `web/` and publishes it to GitHub Pages.

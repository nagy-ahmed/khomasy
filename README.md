# خماسي — Khomasy

Mobile-first Egyptian Arabic football booking and team manager. Public visitors see shared match data without signing in. React + Vite + TypeScript, Tailwind CSS, Lucide and dnd-kit. Hosted on GitHub Pages.

- Live: https://nagy-ahmed.github.io/khomasy/
- Repository: https://github.com/nagy-ahmed/khomasy

## Local development

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Open the printed URL with `/khomasy/`. Vite's base is `/khomasy/`; change it and the icon URL in `index.html` if renaming the repository. `public/config.json` defines the owner, repository, branch and data path. It contains no secret. The app reads the configured GitHub repository even in local development.

## Admin access

1. A GitHub account with write access to `nagy-ahmed/khomasy` is required. Other administrators can be added as repository collaborators.
2. Create an expiring **fine-grained personal access token** at https://github.com/settings/personal-access-tokens/new. Select **only this repository**, with **Contents: Read and write** (Metadata read is implicit). No Actions or workflow permissions are needed for match editing.
3. Open **الإدارة**, enter the token privately, and sign in. GitHub repository metadata must confirm `permissions.push`; GitHub enforces authorization again on every save. A token without the required Contents permission may pass the account check but its saves will be rejected by GitHub.
4. Edit match details, add/rename/remove/confirm players, drag roster handles, drag confirmed players between pitch zones, or use the team select controls. Keyboard roster dragging uses Space → arrows → Space; team selection is the accessible alternative. New players start unconfirmed.
5. Press **حفظ التعديلات للكل**. Draft edits stay local in React state until saved. Logging out, closing, or refreshing clears the token; unsaved edits prompt before leaving.

The token lives only in session memory, is sent only to `api.github.com` using HTTPS and is never written to localStorage, sessionStorage, URLs or JSON. This is a practical static-site admin mechanism, not OAuth. Anyone with a valid repository-writing credential can write data outside this UI. The public roster, venue and shared match details are public repository data. Revoke tokens in GitHub when no longer needed. Prefer narrow, short-lived tokens; repository Contents permission is broader than access to one JSON file.

## Shared persistence and conflicts

`public/data.json` is the human-readable source of truth. Initial roster: exactly 11 players, 10 confirmed, 1 unconfirmed; no date, time or venue is invented. Data includes stable integer IDs, explicit ordering and one nullable team per player. Only confirmed players can be assigned. Teams exceeding five are allowed with a warning. Random teams use confirmed players only and balance the two sides. Capacity controls available spots; five remains the standard team size.

Clients **GET the JSON through GitHub Contents API directly**, not the deployed Pages copy. Fetches bypass browser caching and include a cache-busting query. Public viewers refresh every 60 seconds while visible and on returning to the tab; a refresh button is also available. This avoids waiting for a Pages deployment. API propagation/network conditions can still delay a read. Unauthenticated GitHub API requests are rate-limited per public IP (shared networks may hit this); failures retain the existing view with a warning. An initial failure shows an explicit retry state, not stale seed data presented as current.

Admin saves use Contents API PUT with base64 UTF-8 JSON, the last loaded file SHA and the main branch. Every successful save is a Git commit. A stale SHA results in a visible conflict (409/422); drafts remain available, there is no automatic retry or overwrite. Use **انسخ نسخة من البيانات** to back up a draft, then **تجاهل وحمّل آخر نسخة**, and reapply the intended changes. Background refresh is paused while a draft or save is active. Validated remote data must pass the schema before replacing the view. Dates and countdowns use `Africa/Cairo` through Intl, including DST; nonexistent DST wall times fail validation. End times earlier than start times can represent overnight matches.

## Sharing

**انسخ تفاصيل الماتش** generates a WhatsApp-friendly Arabic message with date/time, location, booking status, all players and teams. **شارك الماتش** and team sharing use Web Share when supported, otherwise copy text and the public link. A selectable text dialog is the fallback when clipboard permissions are unavailable. No WhatsApp account or API service is needed.

## Deployment

`.github/workflows/deploy.yml` builds and deploys on pushes to main. It runs the test suite, TypeScript checks and Vite build before publishing via GitHub Pages Actions. Enable Settings → Pages → Source: GitHub Actions (configured during initial delivery). Source changes deploy automatically. JSON-only updates skip deployment because viewers read the live GitHub API document. Run the workflow manually to rebuild if desired.

No backend, paid service, serverless auth service or secret repository variables are required. The workflow uses GitHub's short-lived built-in `GITHUB_TOKEN`. Do not put an admin token in source, build environment variables or GitHub Pages configuration.

## Verification

`npm test` covers the supplied roster, schema validation, stable reorder, assignment uniqueness, balanced confirmed-only random teams, Cairo winter/summer conversion, Arabic sharing, Unicode/base64, API reads, permission denial, rate limiting and conflict rejection. HTTP client tests simulate GitHub responses locally; deployed read/write verification is documented in `docs/verification.md`. These local checks do not prove token-specific permissions for a newly created admin token.

## Upstream contracts

GitHub Contents API: https://docs.github.com/en/rest/repos/contents
Vite Pages deployment: https://vite.dev/guide/static-deploy.html#github-pages

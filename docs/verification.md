# Verification record

- Full test suite: 16 checks pass across domain, GitHub client and DOM-based UI flows.
- UI flow tests exercise public read-only roster, authenticated edit controls, confirmed-only random teams, Contents API save payload/SHA, refresh persistence and retaining dirty draft on conflict.
- TypeScript and Vite production build pass.
- npm audit after patched test runner update: zero vulnerabilities.
- Independent code review found sparse ordering and Cairo overnight DST-gap bugs; both reproduced with failing regressions and corrected. Configuration failures now expose a reload action.
- Local preview responds HTTP 200 at `/khomasy/`.
- Tokens: React memory only, no browser storage calls, no committed credentials; public config contains repository coordinates only.

Deployment and live API checks are recorded below after GitHub workflow authorization completes. Local simulated API responses do not establish live write permission for any individual admin token.

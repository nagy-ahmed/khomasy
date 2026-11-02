# Verification record

- Full test suite: 16 checks pass across domain, GitHub client and DOM-based UI flows.
- UI flow tests exercise public read-only roster, authenticated edit controls, confirmed-only random teams, Contents API save payload/SHA, refresh persistence and retaining dirty draft on conflict.
- TypeScript and Vite production build pass.
- npm audit after patched test runner update: zero vulnerabilities.
- Independent code review found sparse ordering and Cairo overnight DST-gap bugs; both reproduced with failing regressions and corrected. Configuration failures now expose a reload action.
- Local preview responds HTTP 200 at `/khomasy/`.
- Tokens: React memory only, no browser storage calls, no committed credentials; public config contains repository coordinates only.

Deployment and live API checks are recorded below after GitHub workflow authorization completes. Local simulated API responses do not establish live write permission for any individual admin token.

## Live delivery — 2026-11-02

- GitHub repository: https://github.com/nagy-ahmed/khomasy
- Pages: https://nagy-ahmed.github.io/khomasy/ — verified HTTP 200 and rendered in browser.
- Deployment run 41518411084 completed successfully; CI passed all 16 tests and the production build.
- Live GitHub Contents API PUT with unchanged match/player values succeeded (commit `49f00477f1e31565a3601493c00f0efa294474e9`). Anonymous GET retrieved the same file SHA and exact roster counts 11/10/1.
- Live invalid-SHA PUT was rejected with HTTP 409; shared JSON remained unchanged.
- Browser verified public roster, no editing handles, placeholder match data, confirmed/unconfirmed filter, clipboard success feedback and desktop/390px phone layouts without horizontal overflow.
- Arabic message contents and admin interaction/save/refresh/conflict behavior covered by DOM/unit tests. No real admin credential was entered into the browser during QA. Physical touch dragging and the operating system native share sheet were not exercised; dnd-kit touch/pointer support and copy fallback are implemented.
- No remaining hosting configuration required. Admin creates a narrow expiring Contents-write token for interactive editing as documented in README.

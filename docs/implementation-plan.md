# Khomasy design and delivery plan

User brief: public Egyptian Arabic RTL football booking app; React/Vite/TypeScript, Tailwind, Lucide and dnd-kit, deployed on GitHub Pages. Exactly 11 supplied players, 10 confirmed. No invented venue or date.

## Architecture
- `public/data.json`: shared validated match/player document; immutable player IDs and explicit order.
- `public/config.json`: public repository coordinates only.
- `src/domain.ts`: schema validation, assignment/reorder, Cairo time and sharing helpers.
- `src/github.ts`: public Contents API reads, authenticated SHA-checked writes. Tokens only in React memory; repository write permission is the authority.
- `src/App.tsx` and focused components: public match, roster and pitch; admin login, editable forms, dirty/save/discard state.
- `.github/workflows/deploy.yml`: test/build/deploy on code changes; JSON-only edits skip deployment because clients read API directly.

## Implementation sequence
- [ ] Initialize dependencies; write failing domain tests for exact initial counts, invalid data, assignment safety, random distribution and Cairo conversion.
- [ ] Implement domain model and GitHub adapter; test Unicode round trip, permission denial, conflicts and preserving drafts.
- [ ] Build mobile-first charcoal/green dashboard with pitch art, roster, sharing and accessible drag handles. Admin forms remain hidden until GitHub confirms push permission.
- [ ] Verify tests/build, browser public/mobile interactions and read-only mode. Review security, error and conflict paths.
- [ ] Create public `nagy-ahmed/khomasy`, commit/push, enable Pages Actions and verify public site and live JSON.

## Review focus
Malformed remote data must never replace valid state. Offline/rate-limited reads retain the last view with warning. Concurrent writes stop on stale SHA. Dirty admin drafts survive refresh polling. Cairo dates obey DST and reject nonexistent wall times. Unconfirmed players cannot be assigned. Tokens never enter persistence, logs or committed files.

Authorization: the supplied request explicitly authorizes independent technical decisions, implementation, repository creation, push and publication. No additional design approval stages are needed.

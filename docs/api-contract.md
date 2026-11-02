# GitHub API integration contract

Public base: `https://api.github.com`. Config: `public/config.json`.

- GET `/repos/{owner}/{repo}/contents/{path}?ref={branch}`: public, no credential needed; JSON response must include base64 `content` and file `sha`. Decode UTF-8, JSON parse, then validate before accepting.
- GET `/repos/{owner}/{repo}`: Bearer admin token, verify `permissions.push === true` to enable editing UI.
- PUT `/repos/{owner}/{repo}/contents/{path}`: Bearer token with repository Contents write access. Body: `message`, `content` (base64 UTF-8 JSON), `sha` from last read, `branch`. Accept only a successful response containing `content.sha`.
- Headers: `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`.
- 401: invalid/expired token; 403/429: permissions/rate limit; 409/422: conflict or rejected update, preserve local draft and require reload/reconciliation. Never blindly retry a PUT.
- 15-second timeout and explicit offline feedback. Poll only visible tabs without dirty drafts. Ignore in-flight reads after draft edits or saves.

Authority: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
Orbit discovery was attempted but unavailable from the task network; official GitHub documentation supplied the contract. No custom API or Postman workspace is needed for this small third-party Contents API client.

# Fork Changelog — `shane1794/9router`

Changes that exist **only in this fork**. Upstream never touches this file, which is
why `git merge upstream/master` stays conflict-free.

## Versioning

Fork releases use their own monotonic counter: **`fork.N`** (`fork.1`, `fork.2`, …).
It is independent of upstream's `v0.5.x` line so the two can never collide.

Every entry records the upstream version it sits on as `base`. To read a build:
`fork.3` on `base v0.5.217` means "upstream v0.5.217 plus fork changes 1–3".

`package.json` and `CHANGELOG.md` are kept **byte-identical to upstream** on purpose —
they are the only files that would otherwise conflict on every sync. Fork identity
lives here instead.

**Current build:** `fork.3` on upstream `v0.5.218` (2026-10-19).

---

## fork.3 — 2026-10-19 · base v0.5.218

### What's New

- **`ocz` / `oc` model lists aligned with the OpenCode catalogue** (86 ids on
  https://opencode.ai/docs/zen/, scraped 2026-10-19).
  - `ocz` (OpenCode Zen): added the three ids it was missing —
    `claude-sonnet-4`, `deepseek-v4-flash-vision-exp`, `nemotron-3-ultra-free`.
    The registry now matches the page 1:1 (86/86, verified by set comparison).
  - `oc` (OpenCode Free): added the eight free ids it lacked — `beam-free`,
    `glm-5.3-flash-free`, `longcat-2.5-preview-free`, `mimo-v2.6-flash-free`,
    `nemotron-3-ultra-free`, `nemotron-3.5-lightning-free`,
    `nemotron-3.5-super-vl-free`, `space-bunny-free` — bringing it to 13 entries.
    The five oc-only ids (`muse-spark-1.2-contributor-free`,
    `muse-spark-1.3-contributor-free`, `union-alpha`, `deepseek-v4.1-flash-free`,
    `jev-1.13-free`) are kept: they do not exist on the Zen page and
    `transport.quirks.forceAutoToolChoiceModels` still points at one of them.
  - The paid ids are deliberately **not** added to `oc`: that lane is `noAuth`
    and answers 401 for them, so listing them only produces failed calls.

## fork.2 — 2026-10-18 · base v0.5.218

### What's New

- **The dashboard now shows the fork tag next to the version.** The sidebar read
  `v0.5.218`, indistinguishable from a stock upstream build, so "is this install
  patched?" could not be answered from the UI. It now reads `v0.5.218-fork.2`.
  - `src/shared/constants/forkVersion.js` (new, fork-owned) exports `FORK_VERSION`
    and `withForkTag()`.
  - `src/shared/constants/config.js` — one line: `version: withForkTag(pkg.version)`.
  - Bump `FORK_VERSION` when a fork change lands; the upstream version half follows
    every sync automatically.
  - `package.json` still carries upstream's exact version, and the update check keeps
    comparing that value, so the "update available" banner is unaffected.

## fork.1 — 2026-10-18 · base v0.5.217

### What Was Fixed

- **CodeBuddy Intl (`cbai/*`) failed 100% of requests with HTTP 400 code 11128.**
  The intl gateway (codebuddy.ai) added "channel verification" on 2026-10-15, so any
  request that did not carry the `X-Conversation-*` header family the official IDE
  sends was rejected with `11128` ("conversation id missing", displayTips: "This call
  failed channel verification, possibly because it was not sent from an official
  client"). `CodeBuddyIntlExecutor` now overrides `buildHeaders` to mirror the
  official client:
  - `X-Conversation-ID` — derived stably from the session key (RFC-4122-v5-shaped
    UUID over `session_id` → `prompt_cache_key` → `conversation_id` → opening user
    message → random UUID), so retries of the same turn keep one conversation.
  - `X-Conversation-Request-ID` and `X-Conversation-Message-ID` — fresh UUID per
    request.
  - `codebuddy-cn` (copilot.tencent.com) is not gated upstream and stays untouched.

  Verified A/B against the live upstream with the same credentials and body:
  headers absent → `400`/`11128`, headers present → `200` with normal SSE streaming.

### Provenance

- Source: `Raruu/9router@cd256db` (author yxxrn), cherry-picked with `-x`.
- Fork commit: `fa9f5ac` — `fix(codebuddy-intl): send X-Conversation-* header family
  to pass upstream channel verification`
- Files: `open-sse/executors/codebuddy-intl.js` (+62),
  `tests/unit/codebuddy-intl-conversation-headers.test.js` (+60, new)
- Tests: `tests/unit/codebuddy-intl-conversation-headers.test.js` 5/5 pass;
  `codebuddy-parse-error` + `codebuddy-reasoning-optin` 6/6 pass (no regressions).
- Upstream status: still unfixed at v0.5.217; the same fix is open there as PR #9.

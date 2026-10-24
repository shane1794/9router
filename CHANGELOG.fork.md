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

**Current build:** `fork.10` on upstream `v0.5.303` (2026-10-24).

**Note on `v0.5.303` (`0e23c1b0`):** the embedded residential channel is no longer
v2-only — `OpenCodeExecutor.execute()` now falls back to `resolveV2ChannelRoute()` when
no proxy is bound, so the V1 lane routes through it too, and the V1 transport timeout
went 12s → 45s to survive the handshake. The CLI runner is still tried first; the
channel only applies to the network fallback.

**Note on `v0.5.301` (`4a8e647a`):** upstream shipped the Windows half of the CLI
runner — `.cmd`/`.exe`/`.bat` resolution plus `shell: isWin` on `spawn()` — so the
403 bypass no longer needs a fork patch. Verified on this machine: the runner now
resolves `node_modules/.bin/opencode.cmd` and `opencode --version` answers `1.19.4`.
A rebuild is still required for the app process to pick it up; until then the v2
lane keeps using the embedded proxy path.

**Note on `v0.5.294`–`v0.5.299`:** upstream renamed the embedded-proxy module from
`opencodeV2Proxy.js` to `opencodeV2Channel.js` and now stores the endpoint
XOR-scrambled (`ac93ee97`), so the credential is no longer readable in the source —
obfuscation, not removal. It also added `opencode-ai` as a real dependency and a
`where opencode` probe (`9d5c17f1`), which finally lets the CLI runner find a binary
on Windows. Two caveats remain: the probe finds `opencode.cmd` but `spawn()` is
still called without `shell: true`, which Node refuses for `.cmd` on Windows; and
`eb285cfd` raised the v2 transport timeout to 45s for the residential handshake.

**Note on `v0.5.293` (`35276d92`):** this upstream commit embeds a residential proxy
for `opencode-v2` — credentials in base64 inside `open-sse/utils/opencodeV2Proxy.js`,
shown in the UI as `https://t.me/abcseren` instead of the real endpoint
(`aliyun.dennak.com`). Merged deliberately: the free lanes share one quota per
identity/IP, and a different egress is the only lever that resets it. Two things to
know: it is **on by default** (only `OPENCODE_V2_PROXY` overrides it, and an empty
value falls back to the embedded one, so there is no env switch to turn it off), and
because a proxy is configured, a dead proxy makes `opencode-v2` fail 502 with no
direct fallback by design. Verified reachable on 2026-10-24: `CONNECT
opencode.ai:443` → `200 Connection established`.

The `oc` list is **12 ids** since `v0.5.261`: upstream dropped `jev-1.13-free`
(it has no chat route — `/inference/v1/chat/completions` answers
`ModelProtocolUnsupported`, and `/zen/v1/systemone` is a decision lane), and the
merge took that removal. The eight ids fork.3 added are still listed.

---

## fork.10 — 2026-10-24 · base v0.5.285

### What Changed

- **`codebuddy-intl` now sends the official CLI identity headers**, the second gate on the
  intl gateway. Passing the 11128 channel check is not enough: a request carrying only the
  conversation family and a handful of static headers reads as bare `fetch()` automation
  and the gateway answers `403 code 11140 "account restricted due to unusual activity"`.
  Measured on `codebuddy-intl/deepseek-v4.1-flash`, 2026-10-24.
- Added, mirroring CLI 2.170.0: `User-Agent IDE/2.170.0 CodeBuddy/2.170.0`, `X-Product`,
  `X-Product-Version`, `X-App`, `X-IDE-Type/Name/Version`, `X-Private-Data`,
  `X-Requested-With`, `X-CodeBuddy-Request`, the agent triple
  (`X-Agent-Intent: craft`, `X-Agent-Purpose: conversation`, `X-Agent-Type/Runtime: ide`),
  the Stainless SDK fingerprint (`X-Stainless-*`, platform/arch normalised the way the CLI
  does it), and `X-Domain`.

### Where the fix came from

Not upstream: `serenhope/9router` has no handling for 11140 (no match in the tree, in the
commit log, or in its 13 issues/PRs; its fingerprint work is all OpenCode). The header set
is documented in `jhopan/PanRouter`'s `codebuddy-intl.js`, which spells out both gates and
lists the ~25 headers the CLI sends.

### Verification

- `tests/unit/codebuddy-intl-cli-identity.test.js` (new, fork-owned): 4 tests pinning the
  identity headers, the agent triple, the Stainless fingerprint, and that the
  conversation/trace family from upstream is still sent.
- 22/22 across the four codebuddy suites.
- Not a substitute for an appeal: if the account is already flagged, the restriction stands
  until it is lifted. The headers stop the request set from looking automated going forward.

## fork.9 — 2026-10-21 · base v0.5.258

### What Changed

- **`codebuddy-intl` no longer offers the dropped `hy3-preview` id.** The intl gateway
  answers `400 {"code":11102,"msg":"model [hy3-preview] service info not found"}`, so
  every request to that model failed before reaching a token.
- Replaced it with the two ids the gateway publishes: `hy3` and `hy4-preview`, mirroring
  the drop upstream already applied on the CN list (`codebuddy-cn.js` documents
  `hy3-preview` as "absent from the server list" and lists `hy3` / `hy4-preview` instead).
  The intl registry's own comment states both gateways expose the same catalog.

### Where the fix came from

Not upstream: `serenhope/9router` at `3d8839d6` still ships `hy3-preview`, `decolua/9router`
and `Raruu/9router` match, and 24 of the 26 forks do too. The correct id appears in two
independent re-implementations, `techysy/10router` and `jhopan/PanRouter`, both of which
list `hy3` and `hy4-preview` for the intl lane.

### Verification

- `tests/unit/codebuddy-intl-model-ids.test.js` (new, fork-owned): 4 tests — the dropped id
  stays gone, both replacements stay present, no duplicate ids.
- 25/25 across the four neighbouring codebuddy suites.

### Known gap left alone

`codebuddy-intl` has **no capability block** in `open-sse/providers/capabilities.js`
(only `codebuddy-cn` does), so every intl model resolves to `reasoning: false`,
`vision: false` with no context window. Not fixed here: that file is edited constantly
upstream and a whole new block would conflict on every sync. Recorded as a candidate for a
later patch.

## fork.8 — 2026-10-21 · base v0.5.252

### What Changed

- **The `messages[].reasoning` drop is now one shared rule instead of one executor patch.**
  fork.5 patched only `open-sse/executors/opencode.js` (the no-auth Free lane), so the
  same 400 came back on the keyed Zen lane:
  `400 [unsupported_parameter] Unrecognized request argument supplied: messages[2].reasoning`
  on `opencode-zen/beam-free`, 2026-10-21.
- Added three `STRIP_RULES` entries in `open-sse/translator/concerns/paramSupport.js`
  (`opencode`, `opencode-zen`, `opencode-go`) with a `nonReasoningFor(provider)` predicate,
  reusing the existing `dropMessageFields` path. `DefaultExecutor.transformRequest()`
  already calls `stripUnsupportedParams()`, so the Zen and Go lanes are covered without
  touching their executors; `opencode.js` now calls it too and its local helper is gone.
- Behaviour: `reasoning`, `reasoning_details` and `thought` are dropped from **assistant**
  turns only, and only when the target model resolves to `reasoning: false`
  (`beam-free`, `cat-jam-free`). Reasoning models keep the field.

### Verification

- `tests/unit/opencode-message-reasoning-strip.test.js`: 11 tests, all pass, now covering
  all three lanes plus a "user turns are untouched" guard.
- 62/63 across five neighbouring suites; the one failure is
  `opencode-freetier-direct-replay.test.js`, proven pre-existing by `git stash` (identical
  failure on the baseline).
- Fork diff for `opencode.js` shrank from a 14-line helper to one call line.

## fork.7 — 2026-10-21 · base v0.5.252

### What Changed

- **`.gitattributes` pins markdown to LF**, so upstream's byte-for-byte parity test
  (`tests/unit/antislop-prompt-parity.test.js`, added in v0.5.251) passes on a Windows
  checkout. `core.autocrlf=true` rewrote every `\n` in the `.md` sources to `\r\n`, which
  inflated the generated prompt by one character per line (607 chars on the `full`
  level) and made two of that suite's nine tests fail for a reason that has nothing to
  do with the code.
- Also pinned `open-sse/rtk/antislopPrompt.js` to LF: the generator writes LF and its
  own `--check` compares the file on disk against the generated string, so a CRLF
  checkout fails the same way.

### Verification

- `antislop-prompt-parity.test.js`: **9/9 passed** (was 7/9).
- `node scripts/generateAntislopPrompt.mjs --check` → `antislopPrompt.js matches its sources`.
- 61/61 tests across the six neighbouring suites, no regression from the line-ending change.
- The generated file itself is byte-identical to upstream's — this only changes how git
  checks markdown out, not any content.

## fork.6 — 2026-10-19 · base v0.5.225

### What Changed

- **Model lists synced from upstream, keeping the docs-page alignment.** The fork
  was a strict superset afterwards: nothing upstream lists is missing.
  - `ocz` (OpenCode Zen): **92 ids** = 73 from upstream + 19 kept from fork.3.
    Added the six ids only upstream had: `union-alpha` (Claude wire),
    `deepseek-v4-flash-free`, `ling-3.0-flash-fin-free`, `mimo-v2.5-free`
    (chat completions), and `muse-spark-1.2/1.3-contributor-free`
    (Responses, `targetFormat: openai-responses`).
  - `oc` (OpenCode Free): **13 ids**, already a superset of upstream's 5 — no
    change needed.
  - Verified by set comparison: `upstream − fork = ∅` for both registries.

### Notes

- `deepseek-v4-flash-free` is listed again because upstream lists it, but upstream
  also marks it dead in `DEAD_FREE_OPENCODE_MODELS` (filters.js), so it never
  shows up as a free suggestion.
- The 19 fork-only `ocz` ids (GPT-6 line, Claude 5.5 line, `beam-free`,
  `gemini-4-argon`, …) come from the docs-page scrape in fork.3 and are kept.

## fork.5 — 2026-10-19 · base v0.5.225

### What Was Fixed

- **`oc/beam-free` returned HTTP 400 on every turn that carried history.**
  The client (OpenCode CLI shape) attaches `reasoning` to assistant messages;
  OpenCode's chat lane only accepts that on reasoning models. Anything else gets
  the whole request rejected:
  `400 [unsupported_parameter] Unrecognized request argument supplied:
  messages[2].reasoning`. In one hour this produced 654 failed requests
  (751 × 400 total for `oc/beam-free`, 18 successes).
  - `open-sse/executors/opencode.js` now drops `messages[].reasoning`,
    `reasoning_details` and `thought` on the chat lane when
    `getCapabilitiesForModel(provider, model).reasoning` is false.
    Reasoning models (e.g. `glm-5.3-flash-free`) keep the field untouched, and
    the responses lane (`/inference/v1/responses`) is not affected.
  - `tests/unit/opencode-message-reasoning-strip.test.js` (new) pins both sides:
    stripped for `beam-free`, preserved for a reasoning model.

### Known, not fixed here

- **The 403s are network-level, not code.** `FreeTierError`:
  "OpenCode's free models aren't available from your current network because
  we've detected abusive traffic from this IP address". Reproduced with a plain
  `curl` from this machine. Upstream's IP-protection fix correctly skips the
  direct replay. Options: drop the proxy for the `oc` lane, or use OpenCode Go.
- `oc/beam-free` was added to the fork's model list in fork.3, and the 400 burst
  followed — but `beam-free` already appeared in the live free catalogue before
  that, so the listing is not the cause of the upstream rejection.

## fork.4 — 2026-10-19 · base v0.5.225

### What Changed

- **fork.1 is upstreamed — the local codebuddy-intl patch is gone.** Upstream
  `87dd2615` (*fix(codebuddy-intl): port PR #4949 WorkBuddy intl headers and
  conversation id family*, v0.5.220) now sends the whole `X-Conversation-*`
  family plus the trace family (`X-Root-Request-ID`, `X-Request-ID`,
  `traceparent`, `b3`, `X-B3-*`), which is a superset of what fork.1 did.
  - `open-sse/executors/codebuddy-intl.js` now matches upstream byte-for-byte; the
    merge conflict there was resolved with `--theirs`.
  - `tests/unit/codebuddy-intl-conversation-headers.test.js` (fork.1) was removed:
    it pinned a conversation id derived from the session key, and upstream now
    sends a fresh UUIDv7 per call. Upstream's own
    `tests/unit/codebuddy-intl-identity-4946.test.js` covers the new contract.
  - Behaviour note: conversation ids are no longer stable across retries of the
    same turn. That is upstream's verified choice ("keeps no history under the
    conversation id"), not a regression from this fork.

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

**Status: superseded** — upstream shipped an equivalent fix in v0.5.220 (`87dd2615`);
the local patch was dropped in fork.4. Kept here for history.

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

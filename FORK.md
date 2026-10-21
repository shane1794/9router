# `shane1794/9router` — fork notes

A tracking fork of [`serenhope/9router`](https://github.com/serenhope/9router) that carries a
small set of patches upstream has not merged yet.

- Upstream: `serenhope/9router` (default branch `master`)
- Fork carries: see [`CHANGELOG.fork.md`](./CHANGELOG.fork.md)
- Fork version scheme: `fork.N` — independent of upstream's `v0.5.x` line

## Why the fork has its own version number

Upstream ships several releases per day, so mirroring its `v0.5.x` numbers in fork-only
changelog entries guaranteed a collision (and a `CHANGELOG.md` + `package.json` conflict)
on every single sync. Two releases of `v0.5.214` with different contents is a real
ambiguity when someone reports a bug.

So the split is:

| File | Owner | Rule |
| --- | --- | --- |
| `CHANGELOG.md` | upstream | never edited here — kept byte-identical |
| `package.json` (`version`) | upstream | never edited here — kept byte-identical |
| `CHANGELOG.fork.md` | fork | fork-only entries, numbered `fork.N` |
| `FORK.md` | fork | this file |
| `.gitattributes` | fork | new file; pins markdown (and the generated antislop prompt) to LF |

Because the fork no longer modifies any file upstream also modifies, syncing is a plain
merge with no conflicts.

**Deliberate exceptions** (the only upstream-owned code the fork edits):
`src/shared/constants/config.js` carries a single fork
line (`version: withForkTag(pkg.version)`) so the sidebar can show the fork tag. It is
the only upstream-owned line the fork edits. If a sync ever conflicts there, take
upstream's `version: pkg.version` and re-apply the one-line change — the rest of the
file is untouched.

`open-sse/executors/opencode.js` carries one fork line: it calls
`stripUnsupportedParams()` on the chat lane so non-reasoning models do not get
`messages[].reasoning`. The rule itself lives in
`open-sse/translator/concerns/paramSupport.js` (three `STRIP_RULES` entries, one per
OpenCode lane), which the Zen and Go executors already run through
`DefaultExecutor.transformRequest()`. Same recipe on conflict: take upstream's file and
re-add the three rule lines plus the predicate, then re-add the one call line here.

## Syncing from upstream

```bash
git fetch upstream master
git merge upstream/master          # no conflicts expected
git push origin master
```

If a conflict ever appears, something in the fork started editing an upstream-owned file
again — fix that first rather than resolving the conflict by hand.

## Adding a fork patch

1. Land the change (cherry-pick with `-x`, or a normal commit).
2. Add an entry to `CHANGELOG.fork.md` as `fork.N+1`, recording the upstream `base`
   version and the source commit.
3. Do **not** bump `package.json` and do **not** touch `CHANGELOG.md`.

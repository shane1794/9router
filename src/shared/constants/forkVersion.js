// Fork-owned module. Upstream never touches this file, so `git merge upstream/master`
// stays conflict-free.
//
// Bump FORK_VERSION whenever a fork-only change lands, and add the matching entry to
// CHANGELOG.fork.md. The value is appended to the upstream version in the sidebar, so
// the dashboard reads `v0.5.218-fork.2` while `package.json` keeps upstream's exact
// version (which is what the update check compares against).
export const FORK_VERSION = "fork.9";

export const FORK_REPO = "shane1794/9router";

// 0.5.218 -> 0.5.218-fork.2
export function withForkTag(version) {
  const base = String(version || "").trim();
  if (!FORK_VERSION) return base;
  if (base.endsWith(`-${FORK_VERSION}`)) return base;
  return `${base}-${FORK_VERSION}`;
}

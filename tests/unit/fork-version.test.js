// Fork-owned test: the sidebar must show the fork tag while `package.json` keeps
// upstream's exact version (the update check compares against that one).
import { describe, it, expect } from "vitest";
import pkg from "../../package.json";
import { APP_CONFIG } from "@/shared/constants/config";
import { FORK_VERSION, withForkTag } from "@/shared/constants/forkVersion";

describe("fork version tag", () => {
  it("appends the fork tag to upstream's package version", () => {
    expect(FORK_VERSION).toMatch(/^fork\.\d+$/);
    expect(APP_CONFIG.version).toBe(`${pkg.version}-${FORK_VERSION}`);
  });

  it("leaves package.json untouched", () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_CONFIG.version.startsWith(pkg.version)).toBe(true);
  });

  it("is idempotent", () => {
    const once = withForkTag(pkg.version);
    expect(withForkTag(once)).toBe(once);
  });

  it("keeps a plain version when the tag is empty", () => {
    expect(withForkTag("1.2.3")).toContain("1.2.3");
  });
});

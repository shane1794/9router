// Fork-owned guard (fork.9). The intl gateway dropped `hy3-preview`: it answers
//   400 code 11102 "model [hy3-preview] service info not found"
// (measured 2026-10-21). The CN gateway, which the intl registry itself documents as
// the same catalog, publishes `hy3` and `hy4-preview` — the same drop upstream already
// applied on the CN list. Keep the intl list honest so the picker stops offering a dead id.
import { describe, it, expect } from "vitest";
import registry from "../../open-sse/providers/registry/codebuddy-intl.js";


const ids = (registry.models || []).map((m) => m.id);

describe("codebuddy-intl catalogue", () => {
  it("does not offer the dropped hy3-preview id", () => {
    expect(ids).not.toContain("hy3-preview");
  });

  it("offers the ids the gateway actually publishes", () => {
    expect(ids).toContain("hy3");
    expect(ids).toContain("hy4-preview");
  });

  it("keeps the list free of the dropped id after a re-read", () => {
    // Guard against a sync re-introducing it: the id must stay gone, and the two
    // replacement ids must stay present.
    expect(ids.filter((id) => id === "hy3")).toHaveLength(1);
    expect(ids.filter((id) => id === "hy3-preview")).toHaveLength(0);
  });

  it("has no duplicate ids", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });
});

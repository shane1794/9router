// Chat lane: the client attaches `reasoning` to assistant messages. Plain chat
// models reject the whole request with
//   400 [unsupported_parameter] Unrecognized request argument supplied: messages[2].reasoning
// (beam-free / cat-jam-free, 2026-10-19). Reasoning models must keep the field.
import { describe, it, expect } from "vitest";
import { OpenCodeExecutor } from "../../open-sse/executors/opencode.js";
import { getCapabilitiesForModel } from "../../open-sse/providers/capabilities.js";

const exec = new OpenCodeExecutor();

function bodyWithReasoning() {
  return {
    messages: [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
      { role: "assistant", content: "thinking turn", reasoning: "step by step" },
    ],
  };
}

// applyFingerprintTools() prepends a system message, so look the turn up by content.
const find = (out, content) => (out.messages || []).find((m) => m?.content === content);

describe("OpenCode chat lane drops per-message reasoning for non-reasoning models", () => {
  it("strips messages[].reasoning for beam-free", () => {
    expect(getCapabilitiesForModel("opencode", "beam-free").reasoning).toBe(false);
    const out = exec.transformRequest("beam-free", bodyWithReasoning(), true, {});
    const turn = find(out, "thinking turn");
    expect(turn).toBeTruthy();
    expect(turn.reasoning).toBeUndefined();
  });

  it("keeps messages[].reasoning for a reasoning model", () => {
    expect(getCapabilitiesForModel("opencode", "glm-5.3-flash-free").reasoning).toBe(true);
    const out = exec.transformRequest("glm-5.3-flash-free", bodyWithReasoning(), true, {});
    expect(find(out, "thinking turn").reasoning).toBe("step by step");
  });

  it("keeps the rest of the message intact", () => {
    const out = exec.transformRequest("beam-free", bodyWithReasoning(), true, {});
    expect(find(out, "thinking turn").role).toBe("assistant");
    expect(find(out, "hello")).toBeTruthy();
  });

  it("leaves the responses lane alone", () => {
    const body = { input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "hi" }] }] };
    const out = exec.transformRequest("muse-spark-1.3-contributor-free", body, true, {});
    expect(Array.isArray(out.input)).toBe(true);
  });
});

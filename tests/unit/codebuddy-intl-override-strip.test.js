// Fork-owned guard. Static header overrides (set via /api/providers/:id/overrides
// or via cbai-fix.sh) must not freeze the per-request conversation/trace IDs that
// buildHeaders mints fresh on every call. CodeBuddyIntlExecutor.execute() strips
// the generated family before delegating to base so stale overrides cannot cause
// 11128 "conversation id missing" or 11140 "account restricted" on replay.
import { describe, it, expect, vi } from "vitest";
import { CodeBuddyIntlExecutor } from "../../open-sse/executors/codebuddy-intl.js";

const STALE_CONV_ID = "00000000-0000-0000-0000-000000000001";
const STALE_REQ_ID  = "a".repeat(32);
const STALE_TRACE   = "b".repeat(32);

// Capture the headers that base.execute() would have sent.
function captureHeaders(overrides = {}) {
  const exec = new CodeBuddyIntlExecutor();
  let captured = null;
  vi.spyOn(exec, "buildHeaders").mockImplementation(function (...args) {
    // Call the real buildHeaders and record the result.
    const h = CodeBuddyIntlExecutor.prototype.buildHeaders.apply(this, args);
    captured = h;
    return h;
  });
  // base.execute() applies providerOverrides after buildHeaders; we only need
  // to reach that point. Short-circuit the network call.
  vi.spyOn(exec, "execute").mockImplementation(async function (opts) {
    // Re-run the filtering logic from the real execute override, then apply
    // what base would do (Object.assign overrides onto headers).
    const GENERATED = new Set([
      "x-conversation-id", "x-conversation-request-id", "x-root-request-id",
      "x-conversation-message-id", "x-request-id", "x-trace-id",
      "traceparent", "b3", "x-b3-traceid", "x-b3-spanid", "x-b3-sampled",
    ]);
    const url = "https://www.workbuddy.ai/v2/chat/completions";
    const body = { messages: [{ role: "user", content: "hi" }] };
    const h = CodeBuddyIntlExecutor.prototype.buildHeaders.call(
      this, { accessToken: "t", connectionId: "c" }, true, url, "deepseek-v4.1-flash", body
    );
    captured = { ...h };
    if (opts?.providerOverrides?.headers) {
      const filtered = Object.fromEntries(
        Object.entries(opts.providerOverrides.headers).filter(
          ([k]) => !GENERATED.has(k.toLowerCase())
        )
      );
      Object.assign(captured, filtered);
    }
    return { headers: captured };
  });

  return { exec, getHeaders: () => captured };
}

describe("codebuddy-intl: static override strip", () => {
  it("strips conversation/trace IDs from providerOverrides so fresh values survive", async () => {
    const { exec, getHeaders } = captureHeaders();

    await exec.execute({
      model: "deepseek-v4.1-flash",
      body: { messages: [{ role: "user", content: "hi" }] },
      stream: true,
      credentials: { accessToken: "t", connectionId: "c" },
      providerOverrides: {
        headers: {
          "X-Conversation-ID":         STALE_CONV_ID,
          "X-Conversation-Request-ID": STALE_REQ_ID,
          "X-Root-Request-ID":         STALE_REQ_ID,
          "X-Conversation-Message-ID": STALE_REQ_ID,
          "X-Request-ID":              STALE_REQ_ID,
          "X-Trace-ID":                STALE_TRACE,
          "traceparent":               `00-${STALE_TRACE}-${"c".repeat(16)}-01`,
          "b3":                        `${STALE_TRACE}-${"c".repeat(16)}-1`,
          "X-B3-TraceId":              STALE_TRACE,
          "X-B3-SpanId":               "c".repeat(16),
          "X-B3-Sampled":              "1",
          // Non-generated override: must survive.
          "X-Custom-Header":           "keep-me",
        },
      },
    });

    const h = getHeaders();
    // Fresh IDs must not equal the stale values.
    expect(h["X-Conversation-ID"]).not.toBe(STALE_CONV_ID);
    expect(h["X-Conversation-Request-ID"]).not.toBe(STALE_REQ_ID);
    expect(h["X-Request-ID"]).not.toBe(STALE_REQ_ID);
    // Fresh format must still be valid.
    expect(h["X-Conversation-ID"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(h["X-Conversation-Request-ID"]).toMatch(/^[0-9a-f]{32}$/);
    // Non-generated override must pass through.
    expect(h["X-Custom-Header"]).toBe("keep-me");
  });

  it("passes through non-ID overrides unchanged", async () => {
    const { exec, getHeaders } = captureHeaders();

    await exec.execute({
      model: "deepseek-v4.1-flash",
      body: { messages: [{ role: "user", content: "hi" }] },
      stream: true,
      credentials: { accessToken: "t", connectionId: "c" },
      providerOverrides: {
        headers: {
          "X-Agent-Intent": "craft",
          "X-Custom-Flag":  "yes",
        },
      },
    });

    const h = getHeaders();
    expect(h["X-Agent-Intent"]).toBe("craft");
    expect(h["X-Custom-Flag"]).toBe("yes");
  });

  it("works when providerOverrides is null", async () => {
    const { exec, getHeaders } = captureHeaders();

    await exec.execute({
      model: "deepseek-v4.1-flash",
      body: { messages: [{ role: "user", content: "hi" }] },
      stream: true,
      credentials: { accessToken: "t", connectionId: "c" },
      providerOverrides: null,
    });

    const h = getHeaders();
    expect(h["X-Conversation-ID"]).toMatch(/^[0-9a-f-]{36}$/);
  });
});

// Fork-owned guard (fork.10). The intl gateway has two gates:
//   11128 "conversation id missing"  -> the X-Conversation-* family (upstream)
//   11140 "account restricted"       -> the request looks like bare automation,
//                                       i.e. the CLI identity headers are missing.
// This pins the second gate so a future sync cannot quietly drop the fingerprint.
import { describe, it, expect } from "vitest";
import { CodeBuddyIntlExecutor } from "../../open-sse/executors/codebuddy-intl.js";

const exec = new CodeBuddyIntlExecutor();
const headers = exec.buildHeaders(
  { apiKey: "k", accessToken: "t", connectionId: "c1" },
  true,
  "https://www.workbuddy.ai/v2/chat/completions",
  "deepseek-v4.1-flash",
  { messages: [{ role: "user", content: "hi" }] }
);

describe("codebuddy-intl CLI identity headers", () => {
  it("sends the IDE identity the official CLI sends", () => {
    expect(headers["User-Agent"]).toMatch(/^IDE\/\d+\.\d+\.\d+ CodeBuddy\//);
    expect(headers["X-Product"]).toBe("SaaS");
    expect(headers["X-App"]).toBe("cli");
    expect(headers["X-IDE-Type"]).toBe("IDE");
    expect(headers["X-IDE-Version"]).toBe(headers["User-Agent"].match(/IDE\/([\d.]+)/)[1]);
  });

  it("sends the agent intent triple", () => {
    expect(headers["X-Agent-Intent"]).toBe("craft");
    expect(headers["X-Agent-Purpose"]).toBe("conversation");
    expect(headers["X-Agent-Type"]).toBe("ide");
    expect(headers["X-Agent-Runtime"]).toBe("ide");
  });

  it("sends the Stainless SDK fingerprint", () => {
    expect(headers["X-Stainless-Lang"]).toBe("js");
    expect(headers["X-Stainless-Runtime"]).toBe("node");
    expect(headers["X-Stainless-Helper-Method"]).toBe("stream");
    expect(headers["X-Stainless-OS"]).toMatch(/^(MacOS|Windows|Linux|FreeBSD|OpenBSD|Other:|Unknown)/);
    expect(headers["X-Stainless-Arch"]).toMatch(/^(amd64|arm32|arm64|ppc32|unknown)/);
  });

  it("still sends the conversation family the 11128 gate needs", () => {
    expect(headers["X-Conversation-ID"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers["X-Conversation-Request-ID"]).toMatch(/^[0-9a-f]{32}$/);
    expect(headers["X-Conversation-Message-ID"]).toMatch(/^[0-9a-f]{32}$/);
    expect(headers["X-Request-ID"]).toBe(headers["X-Conversation-Message-ID"]);
    expect(headers["traceparent"]).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });
});

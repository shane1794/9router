// Fork-owned guard (fork.13). The intl gateway has two gates:
//   11128 "conversation id missing"  -> the X-Conversation-* family (upstream)
//   11140 "account restricted"       -> fingerprint mismatch (Agent-Type "ide" instead
//                                       of "main", IDE instead of CLI identity).
// Updated to the codebuddy2api INTL_CLI_VERSION = "2.161.0" capture (fork.13):
// X-IDE-Type/Name "CLI", X-Agent-Type "main", Stainless pinned Linux/x64/v24.21.0.
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
  it("sends the CLI identity the official intl CLI sends (2.161.0)", () => {
    expect(headers["User-Agent"]).toMatch(/^CLI\/\d+\.\d+\.\d+ CodeBuddy\//);
    expect(headers["X-Product"]).toBe("SaaS");
    expect(headers["X-App"]).toBe("cli");
    expect(headers["X-IDE-Type"]).toBe("CLI");
    expect(headers["X-IDE-Name"]).toBe("CLI");
    expect(headers["X-IDE-Version"]).toBe("2.161.0");
  });

  it("sends the agent intent pair with X-Agent-Type main", () => {
    expect(headers["X-Agent-Intent"]).toBe("craft");
    expect(headers["X-Agent-Purpose"]).toBe("conversation");
    expect(headers["X-Agent-Type"]).toBe("main");
    // X-Agent-Runtime not sent by the official intl CLI
    expect(headers["X-Agent-Runtime"]).toBeUndefined();
  });

  it("sends the Stainless SDK fingerprint pinned to the intl reference capture", () => {
    expect(headers["X-Stainless-Lang"]).toBe("js");
    expect(headers["X-Stainless-Runtime"]).toBe("node");
    expect(headers["X-Stainless-OS"]).toBe("Linux");
    expect(headers["X-Stainless-Arch"]).toBe("x64");
    expect(headers["X-Stainless-Runtime-Version"]).toBe("v24.21.0");
    // X-Stainless-Helper-Method not sent by the official intl CLI
    expect(headers["X-Stainless-Helper-Method"]).toBeUndefined();
  });

  it("still sends the conversation family the 11128 gate needs", () => {
    expect(headers["X-Conversation-ID"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers["X-Conversation-Request-ID"]).toMatch(/^[0-9a-f]{32}$/);
    expect(headers["X-Conversation-Message-ID"]).toMatch(/^[0-9a-f]{32}$/);
    expect(headers["X-Request-ID"]).toBe(headers["X-Conversation-Message-ID"]);
    expect(headers["traceparent"]).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });
});

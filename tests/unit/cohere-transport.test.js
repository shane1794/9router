// Fork-owned guard (fork.11). Cohere's OpenAI-compatible surface is /compatibility/v1.
// Upstream's registry posts to /v1/chat/completions, which is not a route on Cohere's
// gateway: the request 405s while /v1/models still validates, so the dashboard "Test"
// stays green and the failure only shows up on the first chat call.
import { describe, it, expect } from "vitest";
import registry from "../../open-sse/providers/registry/cohere.js";

const { baseUrl, validateUrl } = registry.transport;

describe("cohere transport", () => {
  it("posts chat to the compatibility surface", () => {
    expect(baseUrl).toBe("https://api.cohere.ai/compatibility/v1/chat/completions");
  });

  it("does not post to the bare v1 chat path", () => {
    expect(baseUrl).not.toMatch(/^https:\/\/api\.cohere\.ai\/v1\/chat/);
  });

  it("keeps a real endpoint for the connection test", () => {
    expect(validateUrl).toBe("https://api.cohere.ai/v1/models");
  });
});

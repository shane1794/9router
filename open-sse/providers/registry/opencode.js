export default {
  id: "opencode",
  priority: 40,
  hasFree: true,
  alias: "oc",
  uiAlias: "oc",
  display: {
    name: "OpenCode Free",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC",
  },
  category: "free",
  noAuth: true,
  transport: {
    baseUrl: "https://opencode.ai",
    headers: {
      "x-opencode-client": "desktop",
    },
    forceStream: true,
    noAuth: true,
    // Zen reasoning models reject multi-turn history whose assistant messages
    // carry no reasoning_content (400 missing_required_parameter), and the
    // response pipeline strips the field before it reaches the client, so the
    // echo can never come from the client. Inject a placeholder instead.
    reasoningInject: {
      scope: "all",
    },
    quirks: {
      forceAutoToolChoiceModels: ["muse-spark-1.3-contributor-free"],
      // The free lane's MiMo route (OpenRouter-backed) streams thinking as
      // `reasoning` + `reasoning_details[]`, not reasoning_content. stream.js lifts
      // the alias into reasoning_content for OpenAI-shaped clients; every other
      // model on the lane already emits reasoning_content, so the lift is a no-op.
      reasoningAliasFields: true,
    },
  },
  models: [
    // Endpoint formats differ per model, so declare non-chat models explicitly.
    { id: "muse-spark-1.2-contributor-free", name: "Muse Spark 1.2 Contributor Free", targetFormat: "openai-responses" },
    { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 Contributor Free", targetFormat: "openai-responses" },
    { id: "union-alpha", name: "Union Alpha Free", targetFormat: "claude" },
    // jev-1.13-free: systemone lane only — /inference/v1/chat/completions answers
    // ModelProtocolUnsupported. Upstream added it as kind:systemone; kept here.
    { id: "jev-1.13-free", name: "Jev 1.13 Free", kind: "systemone" },
    // Free tier of the Zen catalogue (fork.3+, kept as union with upstream).
    // deepseek-v4.1-flash-free dropped: upstream marks it DEAD_FREE (filters.js).
    { id: "beam-free", name: "Beam Free", supportedFormats: ["openai"] },
    { id: "glm-5.3-flash-free", name: "GLM-5.3-Flash Free", supportedFormats: ["openai"] },
    { id: "longcat-2.5-preview-free", name: "LongCat 2.5 Preview Free", supportedFormats: ["openai"] },
    { id: "mimo-v2.6-flash-free", name: "MiMo-V2.6-Flash Free", supportedFormats: ["openai"] },
    { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra Free", supportedFormats: ["openai"] },
    { id: "nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning Free", supportedFormats: ["openai"] },
    { id: "nemotron-3.5-super-vl-free", name: "Nemotron 3.5 Super VL Free", supportedFormats: ["openai"] },
    { id: "space-bunny-free", name: "Space Bunny Free", supportedFormats: ["openai"] },
  ],
  serviceKinds: ["llm", "systemone"],
  systemoneConfig: {
    baseUrl: "https://opencode.ai/zen/v1/systemone",
    headers: {
      "x-opencode-client": "desktop",
      "User-Agent": "opencode/1.18.31",
    },
  },
  modelsFetcher: { url: "https://opencode.ai/zen/v1/models", type: "opencode-free" },
  passthroughModels: true,
};

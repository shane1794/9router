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
    },
  },
  models: [
    // Endpoint formats differ per model, so declare non-chat models explicitly.
    { id: "muse-spark-1.2-contributor-free", name: "Muse Spark 1.2 Contributor Free", targetFormat: "openai-responses", isFree: true },
    { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 Contributor Free", targetFormat: "openai-responses", isFree: true },
    { id: "union-alpha", name: "Union Alpha Free", targetFormat: "claude", isFree: true },
    { id: "deepseek-v4.1-flash-free", name: "DeepSeek V4.1 Flash Free", supportedFormats: ["openai", "claude", "openai-responses"], isFree: true },
    { id: "jev-1.13-free", name: "Jev 1.13 Free", kind: "systemone", isFree: true },
    // Free tier of the Zen catalogue (https://opencode.ai/docs/zen/, 2026-10-19):
    // the paid ids on that page are deliberately absent — this lane is no-auth and
    // only the free ones answer without a key. All of them carry isFree: true so the
    // unified free list (upstream v0.5.254) keeps them.
    { id: "beam-free", name: "Beam Free", supportedFormats: ["openai"], isFree: true },
    { id: "glm-5.3-flash-free", name: "GLM-5.3-Flash Free", supportedFormats: ["openai"], isFree: true },
    { id: "longcat-2.5-preview-free", name: "LongCat 2.5 Preview Free", supportedFormats: ["openai"], isFree: true },
    { id: "mimo-v2.6-flash-free", name: "MiMo-V2.6-Flash Free", supportedFormats: ["openai"], isFree: true },
    { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra Free", supportedFormats: ["openai"], isFree: true },
    { id: "nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning Free", supportedFormats: ["openai"], isFree: true },
    { id: "nemotron-3.5-super-vl-free", name: "Nemotron 3.5 Super VL Free", supportedFormats: ["openai"], isFree: true },
    { id: "space-bunny-free", name: "Space Bunny Free", supportedFormats: ["openai"], isFree: true },
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

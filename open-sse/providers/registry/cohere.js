export default {
  id: "cohere",
  priority: 90,
  alias: "cohere",
  display: {
    name: "Cohere",
    icon: "hub",
    color: "#39594D",
    textIcon: "CO",
    website: "https://cohere.com",
    notice: {
      apiKeyUrl: "https://dashboard.cohere.com/api-keys",
    },
  },
  category: "apikey",
  transport: {
    // Fork: Cohere's OpenAI-compatible surface lives under /compatibility/v1.
    // POSTing to /v1/chat/completions (upstream's value) hits a path that is not a
    // route on their gateway and answers 405, while /v1/models still validates, so
    // the dashboard "Test" looks green. Cohere v1 chat is POST /v1/chat, v2 is
    // POST /v2/chat; only the compatibility path takes an OpenAI-shaped body.
    baseUrl: "https://api.cohere.ai/compatibility/v1/chat/completions",
    validateUrl: "https://api.cohere.ai/v1/models",
  },
  models: [
    { id: "command-r-plus-08-2024", name: "Command R+ (Aug 2024)" },
    { id: "command-r-08-2024", name: "Command R (Aug 2024)" },
    { id: "command-a-03-2025", name: "Command A (Mar 2025)" },
  ],
};

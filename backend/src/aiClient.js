import "dotenv/config";

const base = (process.env.AZURE_OPENAI_ENDPOINT || "").trim().replace(/\/+$/, "");
const apiKey = (process.env.AZURE_OPENAI_API_KEY || "").trim();
const apiVer = (process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview").trim();
export const deploymentName = (process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini").trim();

const CHAT_URL = `${base}/deployments/${deploymentName}/chat/completions?api-version=${apiVer}`;

async function callChat(messages, max_tokens = 256, temperature = 0.3) {
  const r = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ model: deploymentName, messages, max_tokens, temperature })
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${text.slice(0,200)}`);
  const json = JSON.parse(text);
  return json?.choices?.[0]?.message?.content ?? "";
}

export async function testOpenAI() {
  return callChat([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Say hello from PSA's AI career copilot!" }
  ], 64, 0.3);
}

export async function chatWithAI(userMessage) {
  return callChat([
    { role: "system", content: "You are PSA's Conversational Copilot. Be inclusive, actionable, concise." },
    { role: "user", content: userMessage }
  ], 512, 0.3);
}

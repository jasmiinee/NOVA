import "dotenv/config";
import axios from "axios";

const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").trim();
const apiKey = (process.env.AZURE_OPENAI_API_KEY || "").trim();
const apiVer = (process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview").trim();
export const deploymentName = (process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini").trim();

if (!apiKey) throw new Error("AZURE_OPENAI_API_KEY is missing");
if (!deploymentName) throw new Error("AZURE_OPENAI_DEPLOYMENT is missing");
if (!endpoint) throw new Error("AZURE_OPENAI_ENDPOINT is missing");

// set up reusable HTTP client
const axiosClient = axios.create({
  baseURL: endpoint,
  headers: {
    "api-key": apiKey,
    "Content-Type": "application/json"
  }
});

// for testing
export async function testOpenAI() {
  try {
    const res = await axiosClient.post(
      `/deployments/${deploymentName}/chat/completions?api-version=${apiVer}`,
      {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello from PSA's AI career coach!" }
        ],
        temperature: 0.3,
        max_tokens: 64
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("testOpenAI error:", err.response?.data || err.message);
    throw err;
  }
}

// main function used
export async function chatWithAI(userMessage, systemPrompt) {
  // fallback in case somehow, no systemPrompt is sent over
  const defaultSystemPrompt = "You are PSA's AI Career Coach. Help users with their career development.";
  
  try {
    const res = await axiosClient.post(
      `/deployments/${deploymentName}/chat/completions?api-version=${apiVer}`,
      {
        messages: [
          {
            // develope sends this
            role: "system",
            // gives ai chatbot guidelines
            content: systemPrompt || defaultSystemPrompt
          },
          { 
            // user of the app
            role: "user", 
            // sends the ai chatbot messages
            content: userMessage 
          }
        ],
        temperature: 0.3,
        max_tokens: 512
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("chatWithAI error:", err.response?.data || err.message);
    throw err;
  }
}
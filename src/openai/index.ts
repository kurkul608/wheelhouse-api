import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

const proxyUrl = process.env.PROXY_URL || "";
const agent = new HttpsProxyAgent(proxyUrl);

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: agent,
});

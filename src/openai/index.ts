import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

const proxyUrl = process.env.PROXY_URL || "";
const agent = new HttpsProxyAgent(proxyUrl);

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.LOCAL ? {} : { httpAgent: agent }),
});
//sk-svcacct-hh3L3DzTopPKCofVQ9yH0WtczGzAH-d1f2B8ciu13lPQ7fstbApxH5YJQjZlJugSd9kCJET3BlbkFJ7BELl3Zb2cvCZuVCT-K7fLF_RwnG8KdzXilOnivoSqmhU2gHAIQc8C_6JObIpTdNr1AMQA

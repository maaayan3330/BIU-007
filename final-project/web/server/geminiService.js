import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { guardianContext } from "./context/guardianContext.js";
import { englishPrompt } from "./prompts/englishPrompt.js";
import { hebrewPrompt } from "./prompts/hebrewPrompt.js";
import { isHebrew } from "./utils/languageUtils.js";
import { isGreeting } from "./utils/greetingUtils.js";
import { isRelevantMessage } from "./utils/relevanceUtils.js";
import { replies } from "./constants/replies.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function getGuardianReply(message) {
  const userWroteHebrew = isHebrew(message);
  const selectedPrompt = userWroteHebrew ? hebrewPrompt : englishPrompt;

  if (isGreeting(message)) {
    return userWroteHebrew ? replies.greeting.he : replies.greeting.en;
  }

  if (!isRelevantMessage(message)) {
    return userWroteHebrew ? replies.fallback.he : replies.fallback.en;
  }

  const selectedContext = userWroteHebrew
  ? guardianContext.he
  : guardianContext.en;

const prompt = `
${selectedPrompt}

Product and technical context:
${selectedContext}

User message:
"${message}"

Assistant:
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  return response.text || (userWroteHebrew ? replies.error.he : replies.error.en);
}
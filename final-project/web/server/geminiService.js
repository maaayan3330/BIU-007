import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { englishPrompt } from "./prompts/englishPrompt.js";
import { hebrewPrompt } from "./prompts/hebrewPrompt.js";
import { isHebrew } from "./utils/languageUtils.js";
import { classifyRoute } from "./utils/semanticRouter.js";
import { guardianContextHe } from "./context/guardianContext.he.js";
import { guardianContextEn } from "./context/guardianContext.en.js";

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

  const routeResult = await classifyRoute(message);

  console.log("Route:", routeResult);

  if (routeResult.route === "greeting") {
    return userWroteHebrew
      ? replies.greeting.he
      : replies.greeting.en;
  }

  if (routeResult.route === "gibberish") {
    return userWroteHebrew
      ? "לא בטוח שהבנתי 😊 אפשר לנסח שוב?"
      : "I'm not sure I understood 😊 Could you rephrase?";
  }

  if (routeResult.route === "irrelevant") {
    return userWroteHebrew
      ? replies.fallback.he
      : replies.fallback.en;
  }

  const selectedContext = userWroteHebrew
  ? guardianContextHe
  : guardianContextEn;

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

  return (
    response.text ||
    (userWroteHebrew ? replies.error.he : replies.error.en)
  );
}
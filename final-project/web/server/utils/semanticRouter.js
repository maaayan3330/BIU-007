import { getEmbedding, cosineSimilarity } from "./embeddingUtils.js";
import { hebrewRoutes } from "../routes/guardianRoutes.he.js";
import { englishRoutes } from "../routes/guardianRoutes.en.js";

const ROUTE_THRESHOLD = 0.5;

const routesByLanguage = {
  he: hebrewRoutes,
  en: englishRoutes,
};

let routeEmbeddings = null;

async function initializeRoutes() {
  if (routeEmbeddings) return routeEmbeddings;

  routeEmbeddings = {};

  for (const [language, routes] of Object.entries(routesByLanguage)) {
    for (const [routeName, examples] of Object.entries(routes)) {
      if (!routeEmbeddings[routeName]) {
        routeEmbeddings[routeName] = [];
      }

      for (const example of examples) {
        const embedding = await getEmbedding(example);

        routeEmbeddings[routeName].push({
          text: example,
          language,
          embedding,
        });
      }
    }
  }

  return routeEmbeddings;
}

export async function classifyRoute(message) {
  const text = message.trim();

  if (!text) {
    return {
      route: "gibberish",
      score: 0,
      matchedExample: "",
      matchedLanguage: null,
      messageVector: [],
      matchedExampleVector: [],
    };
  }

  const embeddings = await initializeRoutes();
  const messageEmbedding = await getEmbedding(text);

  let bestRoute = "irrelevant";
  let bestScore = -1;
  let bestExample = "";
  let bestLanguage = null;
  let bestExampleEmbedding = [];

  for (const [routeName, examples] of Object.entries(embeddings)) {
    for (const example of examples) {
      const score = cosineSimilarity(messageEmbedding, example.embedding);

      if (score > bestScore) {
        bestScore = score;
        bestRoute = routeName;
        bestExample = example.text;
        bestLanguage = example.language;
        bestExampleEmbedding = example.embedding;
      }
    }
  }

  const baseResult = {
    route: bestScore < ROUTE_THRESHOLD ? "irrelevant" : bestRoute,
    score: bestScore,
    matchedExample: bestExample,
    matchedLanguage: bestLanguage,
    messageVector: messageEmbedding.slice(0, 10),
    matchedExampleVector: bestExampleEmbedding.slice(0, 10),
  };

  return baseResult;
}
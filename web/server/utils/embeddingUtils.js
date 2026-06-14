import { pipeline } from "@huggingface/transformers";

let extractor = null;

// This function get text and return a vector
export async function getEmbedding(text) {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
  }

  // pooling : Takes the entire sentence and calculates an average
  // normalize : Normalizes the vector
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

// A function that takes two vectors and returns how similar they are.
export function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  // cosine similarity
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
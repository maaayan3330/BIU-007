export function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}
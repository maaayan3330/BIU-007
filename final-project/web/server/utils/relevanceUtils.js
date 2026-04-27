export function isRelevantMessage(message) {
  const text = message.toLowerCase();

  const allowedKeywords = [
    "guardian",
    "digital safety",
    "safety",
    "harmful",
    "toxic",
    "toxicity",
    "content",
    "protection",
    "online",
    "platform",
    "security",
    "גארדיאן",
    "גרדיאן",
    "בטיחות דיגיטלית",
    "בטיחות",
    "הגנה",
    "תוכן פוגעני",
    "תוכן רעיל",
    "רעילות",
    "פוגעני",
    "אונליין",
    "פלטפורמה",
    "אבטחה",
    "סינון תוכן",
  ];

  return allowedKeywords.some((word) => text.includes(word));
}
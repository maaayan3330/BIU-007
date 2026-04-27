export function isGreeting(message) {
  const text = message.toLowerCase().trim();

  const greetings = [
    "hi",
    "hello",
    "hey",
    "שלום",
    "היי",
    "אהלן",
    "מה קורה",
  ];

  return greetings.includes(text);
}
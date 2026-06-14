export async function sendMessageToGuardian(message) {
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Server response error:", errorText);
    throw new Error("Failed to get response from server");
  }

  const data = await response.json();
  return data.reply;
}
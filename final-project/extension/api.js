console.log("API module loaded");

const API_URL = "http://127.0.0.1:8000/predict";

async function isToxic(text, platform) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        platform
      })
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("API RESULT:", data);

    return data.is_toxic === true;
  } catch (error) {
    console.error("Fetch error:", error);
    return false;
  }
}
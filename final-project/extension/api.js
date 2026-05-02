// For debug delete in the end
console.log("API module loaded");

// We no longer need the API_URL here because background.js handles the network request.

// The main function - check if the text is toxic by asking the background script
function isToxic(text, platform) {
  return new Promise((resolve) => {
    // Send a message to background.js
    chrome.runtime.sendMessage(
      { action: "checkToxicity", text: text, platform: platform },
      (response) => {
        // 1. Check if the extension failed to send the message (e.g., background script sleeping)
        if (chrome.runtime.lastError) {
          console.error("Extension communication error:", chrome.runtime.lastError.message);
          return resolve(false); // Default to false so we don't break the page on error
        }
        
        // 2. Check if the background script caught a backend API error
        if (response && response.error) {
          console.error("Backend API error:", response.error);
          return resolve(false);
        }
        
        // 3. Log and return the successful result
        console.log("API RESULT (via background):", response);
        resolve(response.is_toxic === true); 
      }
    );
  });
}
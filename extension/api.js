// For debug delete in the end
console.log("API module loaded");

/**
 * Checks toxicity for a single string of text by asking the background script.
 * @param {string} text Array of strings to check.
 * @param {string} platform The platform name (e.g., 'twitter', 'youtube').
 * @returns {Promise<Object>} A processed result object.
 */
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

/**
 * Checks toxicity for a batch of texts simultaneously.
 * @param {string[]} texts - Array of strings to check.
 * @param {string} platform - The platform name (e.g., 'twitter', 'youtube').
 * @returns {Promise<Object[]>} - Array of processed result objects.
 */
function checkToxicityBatch(texts, platform) {
  return new Promise((resolve) => {
    // If the batch is empty, resolve immediately to avoid useless network calls
    if (!texts || texts.length === 0) {
      return resolve([]);
    }

    // Send the entire array to background.js under a new action name
    chrome.runtime.sendMessage(
      { action: "checkToxicityBatch", texts: texts, platform: platform },
      (response) => {
        // 1. Check if extension communication failed
        if (chrome.runtime.lastError) {
          console.error("Extension communication error:", chrome.runtime.lastError.message);
          return resolve(texts.map(text => ({ text, is_toxic: false })));
        }
        
        // 2. Check if the background script hit a backend API error
        if (response && response.error) {
          console.error("Backend API error:", response.error);
          return resolve(texts.map(text => ({ text, is_toxic: false })));
        }
        
        // 3. Log and return the array of successful batch results
        console.log("API BATCH RESULT (via background):", response);
        resolve(response); 
      }
    );
  });
}
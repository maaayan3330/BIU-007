console.log("Background service worker loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Listen for the specific action we defined in twitter.js / youtube.js
    if (request.action === "checkToxicity") {
        
        fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Send the API result back to the content script
            sendResponse(data); 
        })
        .catch(error => {
            console.error("Fetch error in background script:", error);
            // Send the error back so the content script doesn't hang indefinitely
            sendResponse({ error: error.message, is_toxic: false });
        });

        // CRITICAL: You must return true here to tell Chrome 
        // that sendResponse will be called asynchronously later.
        return true; 
    }
});
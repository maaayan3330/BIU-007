console.log("Twitter module loaded");

(function () {
  let isProcessingTwitter = false;

  async function triggerTwitterReport(commentElement, onModalReady) {
    const tweetContainer = commentElement.closest('article[data-testid="tweet"]');
    if (!tweetContainer) throw new Error("Could not find parent tweet container");

    const twitterConfig = {
      targetContainer: tweetContainer,
      cloakSelectors: `
        #layers [role="menu"], 
        #layers [role="dialog"],
        [data-testid="Dropdown"],
        #layers div[style*="background-color: rgba(0, 0, 0, 0.4)"]
      `,
      menuSelector: '[data-testid="caret"]',
      dropdownSelector: '#layers [role="menu"], #layers [role="dialog"], [data-testid="Dropdown"]',
      reportText: "Report",
      dialogSelector: '#layers [role="dialog"]',
      categoryText: "Hate",
      submitButtonSelectors: 'button[data-testid="ocfFormButton"], button[role="button"]',
      onModalReady: onModalReady,
      isDialogClosed: (dialog) => {
        return dialog && !document.body.contains(dialog);
      },
      isSuccess: () => {
        // Twitter provides a reliable success toast to verify
        const successToast = document.querySelector('[data-testid="toast"]');
        return successToast && successToast.textContent.toLowerCase().includes("report");
      }
    };

    return await window.GuardianAutomation.executeReportSequence(twitterConfig);
  }

  async function processTwitter() {
    if (isProcessingTwitter) return;
    isProcessingTwitter = true;

    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    // Gather all unchecked tweets into parallel arrays
    const newTweetNodes = [];
    const textsToAnalyze = [];

    for (const tweet of tweets) {
      if (tweet.dataset.checked === "true") continue;

      // Mark as checked IMMEDIATELY before processing
      tweet.dataset.checked = "true";

      const textEl = tweet.querySelector('[data-testid="tweetText"]');

      if (!textEl) continue;

      const text = textEl.innerText || "";

      // Skip empty text to save backend processing
      if (text.trim() !== "") {
        // Notice we save textEl because that is what your original code passed to blurElement
        newTweetNodes.push(textEl);
        textsToAnalyze.push(text);
      }
    }

    // If we found new text, send the entire batch at once
    if (textsToAnalyze.length > 0) {
      try {
        const batchResults = await checkToxicityBatch(textsToAnalyze, "twitter");

        // Loop through the results and blur the toxic ones
        for (let i = 0; i < batchResults.length; i++) {
          const result = batchResults[i];
          const textEl = newTweetNodes[i];

          // Map the result index back to the DOM element index
          if (result && result.is_toxic) {
            blurElement(textEl, triggerTwitterReport);
          }
        }
      } catch (error) {
        console.error("Twitter batch classification error:", error);
      }
    }

    isProcessingTwitter = false;
  }

  window.initTwitter = function () {
    setTimeout(() => {
      processTwitter();
    }, 3000);

    const observer = new MutationObserver(() => {
      processTwitter();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

})();
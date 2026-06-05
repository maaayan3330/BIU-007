console.log("Twitter module loaded");

(function() {
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

    for (const tweet of tweets) {
      if (tweet.dataset.checked === "true") continue;

      const textEl = tweet.querySelector('[data-testid="tweetText"]');

      if (!textEl) {
        tweet.dataset.checked = "true";
        continue;
      }

      const text = textEl.innerText || "";

      try {
        const toxic = await isToxic(text, "twitter");

        if (toxic) {
          // Pass our new trigger function to your blurElement handler
          blurElement(textEl, triggerTwitterReport);
        }
      } catch (error) {
        console.error("Twitter classification error:", error);
      }

      tweet.dataset.checked = "true";
    }

    isProcessingTwitter = false;
  }

  window.initTwitter = function() {
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
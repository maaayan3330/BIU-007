console.log("YouTube module loaded");

(function() {
  let isProcessingYouTube = false;

  async function triggerYouTubeReport(commentElement, onModalReady) {
    const threadContainer = commentElement.closest('ytd-comment-thread-renderer') || commentElement.closest('ytd-comment-view-model');
    if (!threadContainer) throw new Error("Could not find parent comment container");

    const youtubeConfig = {
      targetContainer: threadContainer,
      cloakSelectors: `
        ytd-menu-popup-renderer, 
        tp-yt-paper-dialog, 
        tp-yt-iron-overlay-backdrop,
        tp-yt-iron-dropdown,          
        #iron-dropdown 
      `,
      menuSelector: '#action-menu button, button[aria-label="Action menu"]',
      dropdownSelector: 'ytd-menu-popup-renderer, tp-yt-iron-dropdown, tp-yt-paper-dialog, #iron-dropdown',
      reportText: "Report",
      dialogSelector: 'tp-yt-paper-dialog, ytd-popup-container',
      categoryText: "Hateful or abusive", 
      submitButtonSelectors: 'tp-yt-paper-dialog button[aria-label="Report"], tp-yt-paper-dialog #submit-button button, button.yt-spec-button-shape-next--call-to-action',
      onModalReady: onModalReady,
      isDialogClosed: (dialog) => {
        if (!dialog) return true;
        return dialog.style.display === 'none' || 
               dialog.getAttribute('aria-hidden') === 'true' || 
               !document.body.contains(dialog);
      },
      isSuccess: () => {
         // YouTube relies entirely on the submit button event listener for SUCCESS
         return false; 
      }
    };

    return await window.GuardianAutomation.executeReportSequence(youtubeConfig);
  }

  async function processYouTube() {
    if (isProcessingYouTube) return;
    isProcessingYouTube = true;

    const comments = document.querySelectorAll(
      "ytd-comment-thread-renderer #content-text, ytd-comment-view-model #content-text"
    );
   
    for (const comment of comments) {
      if (comment.dataset.checked === "true") continue;

      const text = comment.innerText || "";

      try {
        const toxic = await isToxic(text, "youtube");

        if (toxic) {
          // Pass our new trigger function to your blurElement handler
          blurElement(comment, triggerYouTubeReport);
        }
      } catch (error) {
        console.error("YouTube classification error:", error);
      }

      comment.dataset.checked = "true";
    }

    isProcessingYouTube = false;
  }

  window.initYouTube = function() {
    setTimeout(() => {
      processYouTube();
    }, 3000);
    
    const observer = new MutationObserver(() => {
      processYouTube();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

})();
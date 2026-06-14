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
        if (!document.body.contains(dialog)) return true;

        const tagName = dialog.tagName.toLowerCase();

        // If the automation grabbed the permanent wrapper container
        if (tagName === 'ytd-popup-container') {
          const innerDialog = dialog.querySelector('tp-yt-paper-dialog');
          // It's closed if the inner dialog was deleted OR if it lost its 'opened' state
          return !innerDialog || !innerDialog.hasAttribute('opened');
        }

        // If the automation grabbed the specific paper-dialog itself
        if (tagName === 'tp-yt-paper-dialog') {
          return !dialog.hasAttribute('opened');
        }

        // Fallbacks for any other dialog types
        return dialog.offsetParent === null || 
               dialog.style.display === 'none' || 
               dialog.getAttribute('aria-hidden') === 'true';
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
   
    // Gather all unchecked comments into parallel arrays
    const newCommentNodes = [];
    const textsToAnalyze = [];

    for (const comment of comments) {
      if (comment.dataset.checked === "true") continue;

      const text = comment.innerText || "";
      
      // Mark as checked IMMEDIATELY before the network request 
      // so the MutationObserver doesn't double-queue it on scroll
      comment.dataset.checked = "true";

      // Skip empty comments entirely to save backend processing
      if (text.trim() !== "") {
        newCommentNodes.push(comment);
        textsToAnalyze.push(text);
      }
    }

    // If we found new text, send the entire batch at once
    if (textsToAnalyze.length > 0) {
      try {
        const batchResults = await checkToxicityBatch(textsToAnalyze, "youtube");

        // Loop through the results and blur the toxic ones
        for (let i = 0; i < batchResults.length; i++) {
          const result = batchResults[i];
          const commentNode = newCommentNodes[i];

          // The arrays remain in sync, so index [i] of results maps to index [i] of nodes
          if (result && result.is_toxic) {
            blurElement(commentNode, triggerYouTubeReport);
          }
        }
      } catch (error) {
        console.error("YouTube batch classification error:", error);
      }
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
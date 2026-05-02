console.log("YouTube module loaded");

let isProcessingYouTube = false;

// ==========================================
// STEALTH & RESILIENCE UTILITIES
// ==========================================

/**
 * Pauses execution for a randomized duration to simulate human interaction latency.
 * Helps bypass basic bot-detection mechanisms.
 * * @param {number} min - Minimum delay in milliseconds.
 * @param {number} max - Maximum delay in milliseconds.
 * @returns {Promise<void>}
 */
const humanDelay = (min = 400, max = 800) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Continuously polls the DOM for an element containing specific text.
 * Optimized to only search within active YouTube popups and modals.
 * * @param {string} text - The case-insensitive text to search for.
 * @param {number} [maxWaitMs=5000] - Maximum time to wait before timing out.
 * @returns {Promise<HTMLElement>} Resolves with the found element.
 */
const waitForElementByText = async (text, maxWaitMs = 5000) => {
  const startTime = Date.now();
  const lowerText = text.toLowerCase().trim();

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const containers = document.querySelectorAll('ytd-menu-popup-renderer, tp-yt-iron-dropdown, tp-yt-paper-dialog, #iron-dropdown');
      
      let foundElement = null;
      for (const container of containers) {
        const elements = container.querySelectorAll('*');
        for (const el of elements) {
          if (el.children.length === 0 && el.textContent.toLowerCase().trim().includes(lowerText)) {
            if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
              foundElement = el;
              break;
            }
          }
        }
        if (foundElement) break;
      }

      if (foundElement) {
        clearInterval(interval);
        resolve(foundElement);
      } else if (Date.now() - startTime > maxWaitMs) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for element containing: "${text}"`));
      }
    }, 200); 
  });
};

/**
 * Toggles an invisible shield over the viewport and applies CSS to hide YouTube's 
 * dropdowns and modals. Prevents user interference while the DOM script runs.
 * * @param {boolean} enable - True to engage the cloak, false to remove it.
 */
function toggleCloak(enable) {
  if (enable) {
    const shield = document.createElement("div");
    shield.id = "guardian-shield";
    shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483646;cursor:wait;";
    document.body.appendChild(shield);

    const style = document.createElement("style");
    style.id = "guardian-cloak";
    style.textContent = `
      ytd-menu-popup-renderer, 
      tp-yt-paper-dialog, 
      tp-yt-iron-overlay-backdrop,
      tp-yt-iron-dropdown,          
      #iron-dropdown                
      { 
        opacity: 0 !important; 
        pointer-events: auto !important; 
      }
    `;
    document.head.appendChild(style);
  } else {
    document.getElementById("guardian-shield")?.remove();
    document.getElementById("guardian-cloak")?.remove();
  }
}

// ==========================================
// AUTOMATION SEQUENCE
// ==========================================

/**
 * Executes the automated sequence to open the YouTube reporting modal and select a category.
 * Yields control back to the user for final confirmation or cancellation.
 * * @param {HTMLElement} commentElement - The DOM node containing the targeted comment.
 * @param {Function} onModalReady - Callback triggered when automation completes and waits for user.
 * @returns {Promise<string>} Resolves with "SUCCESS" if submitted, or "CANCELLED" if dismissed.
 */
async function executeReportSequence(commentElement, onModalReady) {
  let safetyTimeout;

  try {
    toggleCloak(true);
    safetyTimeout = setTimeout(() => toggleCloak(false), 10000);

    const threadContainer = commentElement.closest('ytd-comment-thread-renderer') || commentElement.closest('ytd-comment-view-model');
    if (!threadContainer) throw new Error("Could not find parent comment container");

    const actionMenuBtn = threadContainer.querySelector('#action-menu button, button[aria-label="Action menu"]');
    if (!actionMenuBtn) throw new Error("Action menu (3 dots) not found");
    
    actionMenuBtn.click();
    await humanDelay(400, 700);

    const reportMenuOption = await waitForElementByText("Report");
    reportMenuOption.click();
    await humanDelay(800, 1200);

    // TODO: Dynamic category selection based on AI classification models
    const categoryToSelect = "Hateful or abusive"; 
    const categoryRadio = await waitForElementByText(categoryToSelect);
    
    categoryRadio.click();
    await humanDelay(300, 600);

    clearTimeout(safetyTimeout);
    toggleCloak(false);

    if (onModalReady) onModalReady();

    return new Promise((resolve) => {
      const submitBtn = document.querySelector('tp-yt-paper-dialog button[aria-label="Report"], tp-yt-paper-dialog #submit-button button') || document.querySelector('button.yt-spec-button-shape-next--call-to-action');
      const dialog = document.querySelector('tp-yt-paper-dialog') || document.querySelector('ytd-popup-container');
      
      let isResolved = false;

      const finish = (status) => {
          if (isResolved) return;
          isResolved = true;
          observer.disconnect(); 
          resolve(status);
      };

      if (submitBtn) {
          submitBtn.addEventListener('click', () => {
              finish("SUCCESS");
          }, { once: true });
      }

      const observer = new MutationObserver(() => {
          if (dialog) {
              const isHidden = dialog.style.display === 'none' || 
                               dialog.getAttribute('aria-hidden') === 'true' || 
                               !document.body.contains(dialog);
              
              if (isHidden) {
                  finish("CANCELLED");
              }
          }
      });

      if (dialog) {
          observer.observe(dialog, { 
            attributes: true, 
            attributeFilter: ['style', 'aria-hidden'],
            childList: true, 
            subtree: true 
          });
      }
    });
    
  } catch (error) {
    console.error("Guardian Automation Failed:", error);
    throw error; 
  } finally {
    clearTimeout(safetyTimeout);
    toggleCloak(false);
  }
}

// ==========================================
// INITIALIZATION & PROCESSING
// ==========================================

/**
 * Scans the YouTube DOM for newly loaded comments, evaluates their toxicity,
 * and applies the UI blur functionality to flagged elements.
 */
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
        blurElement(comment, executeReportSequence);
      }
    } catch (error) {
      console.error("YouTube classification error:", error);
    }

    comment.dataset.checked = "true";
  }

  isProcessingYouTube = false;
}

/**
 * Bootstraps the YouTube module by running an initial pass and 
 * setting up a MutationObserver to watch for newly rendered comments.
 */
function initYouTube() {
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
}
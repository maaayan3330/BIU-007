console.log("Twitter module loaded");

// Wrap everything in an IIFE (private bubble) to prevent variable collisions with youtube.js
(function() {
  let isProcessingTwitter = false;

  // ==========================================
  // STEALTH & RESILIENCE UTILITIES
  // ==========================================

  /**
   * Pauses execution for a randomized duration to simulate human interaction latency.
   */
  const humanDelay = (min = 400, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * Continuously polls the DOM for an element containing specific text.
   * Optimized to search within Twitter's specific overlay layer (#layers).
   */
  const waitForElementByText = async (text, maxWaitMs = 5000) => {
    const startTime = Date.now();
    const lowerText = text.toLowerCase().trim();

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const containers = document.querySelectorAll('#layers [role="menu"], #layers [role="dialog"], [data-testid="Dropdown"]');
        
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
   * Toggles an invisible shield over the viewport and applies CSS to hide Twitter's dropdowns.
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
        #layers [role="menu"], 
        #layers [role="dialog"],
        [data-testid="Dropdown"] { 
          opacity: 0 !important; 
          pointer-events: auto !important; 
        }
        #layers div[style*="background-color: rgba(0, 0, 0, 0.4)"] {
          opacity: 0 !important;
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

  async function executeReportSequence(commentElement, onModalReady) {
    let safetyTimeout;

    try {
      toggleCloak(true);
      safetyTimeout = setTimeout(() => toggleCloak(false), 10000);

      const tweetContainer = commentElement.closest('article[data-testid="tweet"]');
      if (!tweetContainer) throw new Error("Could not find parent tweet container");

      const actionMenuBtn = tweetContainer.querySelector('[data-testid="caret"]');
      if (!actionMenuBtn) throw new Error("Action menu (caret) not found");
      
      actionMenuBtn.click();
      await humanDelay(400, 700);

      const reportMenuOption = await waitForElementByText("Report");
      reportMenuOption.click();
      await humanDelay(1000, 1500); 

      const categoryToSelect = "Hate"; 
      const categoryRadio = await waitForElementByText(categoryToSelect);
      
      const clickableContainer = categoryRadio.closest('[role="button"]') || categoryRadio;
      clickableContainer.click();
      await humanDelay(300, 600);

      clearTimeout(safetyTimeout);
      toggleCloak(false);

      if (onModalReady) onModalReady();

      return new Promise((resolve) => {
        const dialog = document.querySelector('#layers [role="dialog"]');
        let isResolved = false;

        const finish = (status) => {
            if (isResolved) return;
            isResolved = true;
            observer.disconnect(); 
            resolve(status);
        };

        const observer = new MutationObserver(() => {
            if (dialog) {
                if (!document.body.contains(dialog)) {
                    const successToast = document.querySelector('[data-testid="toast"]');
                    if (successToast && successToast.textContent.toLowerCase().includes("report")) {
                        finish("SUCCESS");
                    } else {
                        finish("CANCELLED");
                    }
                }
            }
        });

        if (dialog) {
            observer.observe(document.body, { childList: true, subtree: true });
            
            const submitBtns = dialog.querySelectorAll('button[data-testid="ocfFormButton"], button[role="button"]');
            submitBtns.forEach(btn => {
              if (btn.textContent.toLowerCase().includes('submit') || btn.textContent.toLowerCase().includes('next')) {
                  btn.addEventListener('click', () => {
                      setTimeout(() => finish("SUCCESS"), 500);
                  });
              }
            });
        } else {
            finish("CANCELLED"); 
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
          blurElement(textEl, executeReportSequence);
        }
      } catch (error) {
        console.error("Twitter classification error:", error);
      }

      tweet.dataset.checked = "true";
    }

    isProcessingTwitter = false;
  }

  // Expose ONLY initTwitter to the global window object so content.js can access it
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

})(); // End of IIFE Bubble
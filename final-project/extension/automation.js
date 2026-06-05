console.log("Guardian Automation Engine loaded");

// Expose globally so content scripts can access it without ES Modules
window.GuardianAutomation = (function() {
  
  const humanDelay = (min = 400, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const waitForElementByText = async (containerSelector, text, maxWaitMs = 5000) => {
    const startTime = Date.now();
    const lowerText = text.toLowerCase().trim();

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const containers = document.querySelectorAll(containerSelector);
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
          reject(new Error(`Timeout waiting for "${text}" in ${containerSelector}`));
        }
      }, 200);
    });
  };

  function toggleCloak(enable, cssSelectorsToHide = "") {
    if (enable) {
      if (!document.getElementById("guardian-shield")) {
        const shield = document.createElement("div");
        shield.id = "guardian-shield";
        shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483646;cursor:wait;";
        document.body.appendChild(shield);
      }

      if (!document.getElementById("guardian-cloak") && cssSelectorsToHide) {
        const style = document.createElement("style");
        style.id = "guardian-cloak";
        style.textContent = `
          ${cssSelectorsToHide} { 
            opacity: 0 !important; 
            pointer-events: auto !important; 
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.getElementById("guardian-shield")?.remove();
      document.getElementById("guardian-cloak")?.remove();
    }
  }

  /**
   * Orchestrates the reporting steps based on a platform-specific configuration object.
   */
  async function executeReportSequence(config) {
    let safetyTimeout;

    try {
      toggleCloak(true, config.cloakSelectors);
      safetyTimeout = setTimeout(() => toggleCloak(false), 10000);

      // 1. Open Menu
      const actionMenuBtn = config.targetContainer.querySelector(config.menuSelector);
      if (!actionMenuBtn) throw new Error("Action menu not found");
      actionMenuBtn.click();
      await humanDelay(400, 700);

      // 2. Click Report Option
      const reportMenuOption = await waitForElementByText(config.dropdownSelector, config.reportText);
      reportMenuOption.click();
      await humanDelay(800, 1500);

      // 3. Select Category
      const categoryRadio = await waitForElementByText(config.dialogSelector, config.categoryText);
      const clickableContainer = categoryRadio.closest('[role="button"]') || categoryRadio;
      clickableContainer.click();
      await humanDelay(300, 600);

      clearTimeout(safetyTimeout);
      toggleCloak(false);

      if (config.onModalReady) config.onModalReady();

      // 4. Wait for User Resolution
      return new Promise((resolve) => {
        const dialog = document.querySelector(config.dialogSelector);
        let isResolved = false;

        const finish = (status) => {
          if (isResolved) return;
          isResolved = true;
          observer.disconnect();
          resolve(status);
        };

        // Attach fast-resolve to submit buttons if provided
        if (config.submitButtonSelectors && dialog) {
          const submitBtns = dialog.querySelectorAll(config.submitButtonSelectors);
          submitBtns.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('submit') || btn.textContent.toLowerCase().includes('next') || btn.textContent.toLowerCase().includes('report')) {
                btn.addEventListener('click', () => setTimeout(() => finish("SUCCESS"), 500));
            }
          });
        }

        const observer = new MutationObserver(() => {
          if (config.isDialogClosed(dialog)) {
            if (config.isSuccess()) {
              finish("SUCCESS");
            } else {
              finish("CANCELLED");
            }
          }
        });

        if (dialog) {
          observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true, 
            attributeFilter: ['style', 'aria-hidden']
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

  return {
    humanDelay,
    waitForElementByText,
    toggleCloak,
    executeReportSequence
  };
})();
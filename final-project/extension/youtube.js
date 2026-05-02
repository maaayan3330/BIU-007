console.log("YouTube module loaded"); // logs

let isProcessingYouTube = false;

// ==========================================
// PHASE 2: STEALTH & RESILIENCE UTILITIES
// ==========================================

// 1. Jitter Engine: Randomize delays to bypass basic bot detection
const humanDelay = (min = 400, max = 800) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 2. Safe Selector: Upgraded to search universally within active popups
const waitForElementByText = async (text, maxWaitMs = 5000) => {
  const startTime = Date.now();
  const lowerText = text.toLowerCase().trim();

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      // Look inside ALL elements, but only within the active menu or modal containers to save performance
      const containers = document.querySelectorAll('ytd-menu-popup-renderer, tp-yt-iron-dropdown, tp-yt-paper-dialog, #iron-dropdown');
      
      let foundElement = null;
      for (const container of containers) {
        const elements = container.querySelectorAll('*');
        for (const el of elements) {
          // Only check elements that have no children (the innermost text nodes)
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

// 3. Shield Strategy: Upgraded to hide iron-dropdowns
function toggleCloak(enable) {
  if (enable) {
    // Inject invisible overlay to block accidental user clicks
    const shield = document.createElement("div");
    shield.id = "guardian-shield";
    shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483646;cursor:wait;";
    document.body.appendChild(shield);

    // Inject CSS to visually hide YouTube's reporting popups
    const style = document.createElement("style");
    style.id = "guardian-cloak";
    style.textContent = `
      ytd-menu-popup-renderer, 
      tp-yt-paper-dialog, 
      tp-yt-iron-overlay-backdrop,
      tp-yt-iron-dropdown,          /* Hides the new 3-dots dropdown container */
      #iron-dropdown                /* Catch-all for older UI dropdowns */
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
// PHASE 2: AUTOMATION SEQUENCE
// ==========================================

async function executeReportSequence(commentElement) {
  let safetyTimeout;

  try {
    console.log("🟢 [Guardian] Step 1: Engaging Shield");
    toggleCloak(true);
    safetyTimeout = setTimeout(() => toggleCloak(false), 8000);

    console.log("🟢 [Guardian] Step 2: Locating 3-dots menu for the comment");
    const threadContainer = commentElement.closest('ytd-comment-thread-renderer') || commentElement.closest('ytd-comment-view-model');
    if (!threadContainer) throw new Error("Could not find parent comment container");

    const actionMenuBtn = threadContainer.querySelector('#action-menu button, button[aria-label="Action menu"]');
    if (!actionMenuBtn) throw new Error("Action menu (3 dots) not found");
    
    console.log("🟢 [Guardian] Step 3: Clicking 3-dots menu");
    actionMenuBtn.click();
    await humanDelay(400, 700);

    console.log("🟢 [Guardian] Step 4: Waiting for 'Report' option in dropdown");
    const reportMenuOption = await waitForElementByText("Report");
    console.log("🟢 [Guardian] Step 5: Clicking 'Report' option");
    reportMenuOption.click();
    await humanDelay(800, 1200);

    console.log("🟢 [Guardian] Step 6: Waiting for 'Hateful or abusive' category");
    const categoryRadio = await waitForElementByText("Hateful or abusive");
    console.log("🟢 [Guardian] Step 7: Clicking category");
    categoryRadio.click();
    await humanDelay(300, 600);

    console.log("🟢 [Guardian] Step 8: Looking for Submit button");
    const submitBtn = document.querySelector('tp-yt-paper-dialog button[aria-label="Report"], tp-yt-paper-dialog #submit-button button');
    if (submitBtn) {
       submitBtn.click();
    } else {
       const fallbackSubmit = await waitForElementByText("Report", 2000); 
       fallbackSubmit.click();
    }
    await humanDelay(800, 1500);

    console.log("🟢 [Guardian] Step 9: Waiting for Close toast");
    const closeToastBtn = await waitForElementByText("Close", 3000).catch(() => null); 
    if (closeToastBtn) closeToastBtn.click();

    console.log("✅ [Guardian] SUCCESS: Report submitted to YouTube.");

  } catch (error) {
    console.error("❌ [Guardian] FAILED AT:", error);
    throw error; 
  } finally {
    clearTimeout(safetyTimeout);
    toggleCloak(false);
  }
}

// ==========================================
// ORIGINAL LOGIC (UPDATED WITH HOOK)
// ==========================================

async function processYouTube() {
  if (isProcessingYouTube) return;
  isProcessingYouTube = true;

  // Added ytd-comment-view-model to support YouTube's newer UI layouts
  const comments = document.querySelectorAll(
    "ytd-comment-thread-renderer #content-text, ytd-comment-view-model #content-text"
  );
 
  for (const comment of comments) {
    if (comment.dataset.checked === "true") continue;

    const text = comment.innerText || "";

    try {
      // This seamlessly calls the global isToxic function from api.js file
      const toxic = await isToxic(text, "youtube");

      if (toxic) {
        // Pass the executeReportSequence down to the UI module
        blurElement(comment, executeReportSequence);
      }
    } catch (error) {
      console.error("YouTube classification error:", error);
    }

    comment.dataset.checked = "true";
  }

  isProcessingYouTube = false;
}

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
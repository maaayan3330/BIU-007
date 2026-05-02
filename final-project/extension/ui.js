console.log("UI module loaded");

// Updated to accept the onReportClick callback from the platform adapter
function blurElement(element, onReportClick) {
  if (element.dataset.toxicProcessed === "true") return;

  element.classList.add("blurred");
  element.classList.add("toxic-content");

  const banner = document.createElement("div");
  banner.className = "toxic-banner";

  const warning = document.createElement("span");
  warning.className = "toxic-warning";
  warning.innerText = "This comment was flagged as toxic";

  // --- Show/Hide Toggle Button (Existing) ---
  const button = document.createElement("button");
  button.className = "toxic-toggle-btn";
  button.innerText = "Show";

  let isHidden = true;

  button.addEventListener("click", () => {
    isHidden = !isHidden;

    if (isHidden) {
      element.classList.add("blurred");
      button.innerText = "Show";
    } else {
      element.classList.remove("blurred");
      button.innerText = "Hide";
    }
  });

  // --- NEW: Report Button Logic ---
  const reportBtn = document.createElement("button");
  reportBtn.className = "toxic-toggle-btn"; 
  reportBtn.innerText = "Report to platform";

  reportBtn.addEventListener("click", async () => {
    // 1. Visual Feedback & Disable: Prevent duplicate clicks
    reportBtn.disabled = true;
    reportBtn.innerText = "Reporting...";
    reportBtn.classList.add("reporting-state"); // Useful for adding a CSS spinner

    if (onReportClick) {
      try {
        // 2. Trigger the platform-specific DOM automation script
        // We pass the raw element so youtube.js/twitter.js can extract the commentId
        await onReportClick(element);

        // 3. Success State
        reportBtn.innerText = "Reported ✔";
        reportBtn.classList.replace("reporting-state", "reported-success");
        // We leave it disabled so the user cannot report the same comment twice
      } catch (error) {
        // 4. Error State / Rollback
        console.error("Guardian Reporting Sequence Failed:", error);
        reportBtn.disabled = false;
        reportBtn.innerText = "Report Failed. Try Again?";
        reportBtn.classList.remove("reporting-state");
      }
    } else {
      console.warn("No reporting handler attached to this platform.");
      reportBtn.disabled = false;
      reportBtn.innerText = "Report to platform";
    }
  });

  // Create a container for the buttons
  const actionContainer = document.createElement("div");
  actionContainer.className = "toxic-actions";

  // Append buttons to the container instead of the banner
  actionContainer.appendChild(reportBtn);
  actionContainer.appendChild(button); // The show/hide button

  // Append the text and the new container to the banner
  banner.appendChild(warning);
  banner.appendChild(actionContainer);
  
  element.parentNode.insertBefore(banner, element);

  element.dataset.toxicProcessed = "true";
}
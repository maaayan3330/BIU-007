console.log("UI module loaded");

/**
 * Applies a blur effect to an element containing toxic content and inserts a warning banner.
 * The banner includes controls to toggle the blur visibility and automate reporting the content.
 *
 * @param {HTMLElement} element - The DOM element containing the text to be blurred.
 * @param {Function} [onReportClick] - Optional async callback triggered when the report button is clicked.
 * Handles the platform-specific DOM automation sequence.
 * Receives the original element and a UI-update callback.
 * Should return a Promise resolving to "SUCCESS" or "CANCELLED".
 */
function blurElement(element, onReportClick) {
  if (element.dataset.toxicProcessed === "true") return;

  element.classList.add("blurred");
  element.classList.add("toxic-content");

  const banner = document.createElement("div");
  banner.className = "toxic-banner";

  const warning = document.createElement("span");
  warning.className = "toxic-warning";
  warning.innerText = "This comment was flagged as toxic";

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

  const reportBtn = document.createElement("button");
  reportBtn.className = "toxic-toggle-btn"; 
  reportBtn.innerText = "Report to platform";

  reportBtn.addEventListener("click", async () => {
    reportBtn.disabled = true;
    reportBtn.innerText = "Automating...";
    reportBtn.classList.add("reporting-state"); 

    if (onReportClick) {
      try {
        const status = await onReportClick(element, () => {
          reportBtn.innerText = "Confirm on screen";
          reportBtn.classList.replace("reporting-state", "reported-pending");
          reportBtn.style.backgroundColor = "#555";
        });

        if (status === "CANCELLED") {
          reportBtn.disabled = false;
          reportBtn.innerText = "Report to platform";
          reportBtn.style.backgroundColor = "";
          reportBtn.classList.remove("reported-pending");
        } else if (status === "SUCCESS") {
          reportBtn.innerText = "Reported ✔";
          reportBtn.classList.replace("reported-pending", "reported-success");
          reportBtn.style.backgroundColor = "";
        }

      } catch (error) {
        console.error("Guardian Reporting Sequence Failed:", error);
        reportBtn.disabled = false;
        reportBtn.innerText = "Automation Failed. Try Again?";
        reportBtn.style.backgroundColor = "";
        reportBtn.classList.remove("reporting-state");
      }
    } else {
      console.warn("No reporting handler attached to this platform.");
      reportBtn.disabled = false;
      reportBtn.innerText = "Report to platform";
    }
  });

  const actionContainer = document.createElement("div");
  actionContainer.className = "toxic-actions";

  actionContainer.appendChild(reportBtn);
  actionContainer.appendChild(button);

  banner.appendChild(warning);
  banner.appendChild(actionContainer);
  
  element.parentNode.insertBefore(banner, element);

  element.dataset.toxicProcessed = "true";
}
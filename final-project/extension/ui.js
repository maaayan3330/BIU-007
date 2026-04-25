console.log("UI module loaded");

function blurElement(element, onReportClick) {
  if (element.dataset.toxicProcessed === "true") return;

  element.classList.add("blurred", "toxic-content");

  const banner = document.createElement("div");
  banner.className = "toxic-banner";

  const warning = document.createElement("span");
  warning.className = "toxic-warning";
  warning.innerText = "This comment was flagged as toxic";

  // Create a container to keep the buttons grouped together
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "toxic-button-group";

  const showHideButton = document.createElement("button");
  showHideButton.className = "toxic-toggle-btn";
  showHideButton.innerText = "Show";

  const reportButton = document.createElement("button");
  reportButton.className = "toxic-toggle-btn"; 
  reportButton.innerText = "Report to platform";

  let isHidden = true;

  showHideButton.addEventListener("click", () => {
    isHidden = !isHidden;

    if (isHidden) {
      element.classList.add("blurred");
      showHideButton.innerText = "Show";
    } else {
      element.classList.remove("blurred");
      showHideButton.innerText = "Hide";
    }
  });

  reportButton.addEventListener("click", async () => {
    if (typeof onReportClick !== 'function') {
      console.error("Guardian: No reporting handler provided for this platform.");
      return;
    }

    reportButton.innerText = "Reporting...";
    reportButton.disabled = true;
    reportButton.style.cursor = "wait";
    
    // Trigger the DOM automation passed in from youtube.js/twitter.js
    const success = await onReportClick(element, "Hateful or abusive content");

    if (success) {
      reportButton.innerText = "Reported";
      reportButton.style.backgroundColor = "green";
      reportButton.style.color = "white"; 
      reportButton.style.cursor = "default";
    } else {
      reportButton.innerText = "Report Failed";
      reportButton.disabled = false;
      reportButton.style.cursor = "pointer";
    }
  });

  // Append both buttons to the container
  buttonContainer.appendChild(showHideButton);
  buttonContainer.appendChild(reportButton);

  // Append the warning and the button container to the banner
  banner.appendChild(warning);
  banner.appendChild(buttonContainer);

  element.parentNode.insertBefore(banner, element);

  element.dataset.toxicProcessed = "true";
}
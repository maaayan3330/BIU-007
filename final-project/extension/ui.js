console.log("UI module loaded");

function blurElement(element) {
  if (element.dataset.toxicProcessed === "true") return;

  element.classList.add("blurred");
  element.classList.add("toxic-content");

  const banner = document.createElement("div");
  banner.className = "toxic-banner";

  const warning = document.createElement("span");
  warning.className = "toxic-warning";
  warning.innerText = "This comment was flagged as toxic";

  // Create a container to keep the buttons grouped together
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "toxic-button-group";

  const button = document.createElement("button");
  button.className = "toxic-toggle-btn";
  button.innerText = "Show";

  const report_button = document.createElement("button");
  report_button.className = "toxic-toggle-btn";
  report_button.innerText = "Report to platform";

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

  // Placeholder for the automated reporting DOM traversal script
  report_button.addEventListener("click", () => {
    report_button.innerText = "Reporting...";
    report_button.disabled = true;
    
    // Trigger the background script / DOM automation here
    console.log("Triggering automated platform report...");
  });

  // Append both buttons to the container
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(report_button);

  // Append the warning and the button container to the banner
  banner.appendChild(warning);
  banner.appendChild(buttonContainer);
  
  element.parentNode.insertBefore(banner, element);

  element.dataset.toxicProcessed = "true";
}
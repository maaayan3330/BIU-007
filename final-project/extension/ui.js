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

  banner.appendChild(warning);
  banner.appendChild(button);

  element.parentNode.insertBefore(banner, element);

  element.dataset.toxicProcessed = "true";
}
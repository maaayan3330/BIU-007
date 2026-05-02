console.log("YouTube module loaded"); // logs

let isProcessingYouTube = false;

async function processYouTube() {
  if (isProcessingYouTube) return;
  isProcessingYouTube = true;

  const comments = document.querySelectorAll(
    "ytd-comment-thread-renderer #content-text"
  );
 
  for (const comment of comments) {
    if (comment.dataset.checked === "true") continue;

    const text = comment.innerText || "";

    try {
      // This seamlessly calls the global isToxic function from api.js file
      const toxic = await isToxic(text, "youtube");

      if (toxic) {
        blurElement(comment);
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
console.log("YouTube module loaded"); // delete later

let isProcessingYouTube = false;

// The main function that go all over the comments
async function processYouTube() {
  if (isProcessingYouTube) return;
  isProcessingYouTube = true;

  const comments = document.querySelectorAll(
    "ytd-comment-thread-renderer #content-text"
  );

  console.log("Found YouTube comments:", comments.length); // delete later
 
  // For every comment
  for (const comment of comments) {
    // If we allredy check so skip
    if (comment.dataset.checked === "true") continue;
    // Get the text of the comment
    const text = comment.innerText || "";

    try {
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
  // Observe for new comments when you scroll
  const observer = new MutationObserver(() => {
    processYouTube();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
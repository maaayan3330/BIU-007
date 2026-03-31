console.log("Twitter module loaded");

let isProcessingTwitter = false;

async function processTwitter() {
  if (isProcessingTwitter) return;
  isProcessingTwitter = true;

  const tweets = document.querySelectorAll('article[data-testid="tweet"]');

  console.log("Found tweets:", tweets.length);

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
        blurElement(textEl);
      }
    } catch (error) {
      console.error("Twitter classification error:", error);
    }

    tweet.dataset.checked = "true";
  }

  isProcessingTwitter = false;
}

function initTwitter() {
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
}
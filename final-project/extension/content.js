console.log("Toxic Filter loaded");

const API_URL = "http://127.0.0.1:8000/predict";

function blurElement(element) {
  element.classList.add("blurred");
}

async function isToxic(text, platform) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        platform
      })
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("API RESULT:", data);

    return data.is_toxic === true;
  } catch (error) {
    console.error("Fetch error:", error);
    return false;
  }
}

let isProcessingYouTube = false;

async function processYouTube() {
  if (isProcessingYouTube) return;
  isProcessingYouTube = true;

  const comments = document.querySelectorAll(
    "ytd-comment-thread-renderer #content-text"
  );

  console.log("Found YouTube comments:", comments.length);

  for (const comment of comments) {
    if (comment.dataset.checked === "true") continue;

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

function init() {
  const host = window.location.hostname;

  if (host.includes("youtube.com")) {
    console.log("YouTube detected");
    initYouTube();
  } else if (host.includes("x.com") || host.includes("twitter.com")) {
    console.log("Twitter/X detected");
    initTwitter();
  }
}

init();
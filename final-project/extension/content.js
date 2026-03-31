console.log("Toxic Filter loaded"); // delete later

function init() {
  const host = window.location.hostname;

  if (host.includes("youtube.com")) {
    console.log("YouTube detected"); // delete
    initYouTube();
  } else if (host.includes("x.com") || host.includes("twitter.com")) {
    console.log("Twitter/X detected"); // delete
    initTwitter();
  }
}

init();

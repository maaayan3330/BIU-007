console.log("Toxic Filter loaded"); 

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

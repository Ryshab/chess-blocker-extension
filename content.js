console.log("Chess Blocker Loaded");

let gameDetected = false;

function incrementGameCount() {
  chrome.storage.local.get(["gameCount"], (result) => {
    let count = result.gameCount || 0;

    count++;

    chrome.storage.local.set({ gameCount: count }, () => {
      console.log("Game count updated:", count);

      // If user has played 3 or more games → block
      if (count >= 3) {
        const blockedUntil = Date.now() + 60000 * 5 // 2 hours in ms

        chrome.storage.local.set({ blockedUntil }, () => {
          console.log("User blocked until:", new Date(blockedUntil));
          blockUser(blockedUntil);
        });
      }
    });
  });
}
const observer = new MutationObserver(() => {

  const gameOverModal = document.querySelector('[data-cy="game-over-header"]');

  if (gameOverModal && !gameDetected) {
    gameDetected = true;
    console.log("Game Over Detected!");
    incrementGameCount();
  }

  // New game started/ modal gone
  if(!gameOverModal && gameDetected) {
    console.log('Restarting tracker for a new game .....')
    gameDetected = false;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

setInterval(() => {
  chrome.storage.local.get(["blockedUntil"], (result) => {
    const blockedUntil = result.blockedUntil;

    if (blockedUntil && Date.now() >= blockedUntil) {
      console.log("Cooldown finished. Resetting...");

      chrome.storage.local.set({
        gameCount: 0,
        blockedUntil: null,
      });

      const overlay = document.getElementById("chess-blocker-overlay");
      if (overlay) overlay.remove();
    }
  });
}, 60000); // check every 1 min

function blockUser(blockedUntil) {
  // Prevent multiple overlays
  if (document.getElementById("chess-blocker-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "chess-blocker-overlay";

  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "black";
  overlay.style.color = "white";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "999999";

  const timeleft = Math.ceil((blockedUntil - Date.now()) / 60000);

  overlay.innerHTML = `
    <h1>STOP PLAYING</h1>
    <p>You have reached your limit of 3 games.</p>
    <p>Come back in ${timeleft} minutes.</p>
  `;

  document.body.appendChild(overlay);
}
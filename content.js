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
        const blockedUntil = Date.now() + 60000 * 60 // 1 hours in ms

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

  const imageUrl = chrome.runtime.getURL("icons/icon1.jpeg");

overlay.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <!-- Chess Timer Icon -->
      <img src="${imageUrl}" 
           alt="Chess Timer" 
           style="width: 180px; height: 180px; margin-bottom: 30px;">
      
      <h1 style="font-size: 3em; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">STOP PLAYING</h1>
      
      <p style="font-size: 1.5em; margin: 10px 0;">You have reached your limit of 3 games.</p>
      
      <p style="font-size: 2em; margin: 20px 0; background: rgba(255,0,0,0.2); padding: 15px 30px; border-radius: 10px;">
        Come back in <strong>${timeleft}</strong> minutes
      </p>
    </div>
  `;

// overlay.innerHTML = `
//   <img src="${imageUrl}" alt="Stop Playing" style="width:150px; margin-bottom:20px;" />
//   <h1>STOP PLAYING</h1>
//   <p>You have reached your limit of 3 games.</p>
//   <p style="font-size: 2em; margin: 20px 0; background: rgba(255,0,0,0.2); padding: 15px 30px; border-radius: 10px;">
//   Come back in ${timeleft} minutes.</p>
// `;


  document.body.appendChild(overlay);
}
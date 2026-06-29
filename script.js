const lines = [
  "LOADING RAVE DATABASE...",
  "CHECKING VINYL ARCHIVE...",
  "SCANNING DANCEFLOOR...",
  "SYNCHRONISING HARD HOUSE FREQUENCIES...",
  "CONNECTION ESTABLISHED."
];

const enterBtn = document.getElementById("enterBtn");

let i = 0;

setInterval(() => {
  if (i < lines.length) {
    document.getElementById("line1").textContent = lines[Math.max(0, i - 2)] || "";
    document.getElementById("line2").textContent = lines[Math.max(0, i - 1)] || "";
    document.getElementById("line3").textContent = lines[i];
    i++;
  }
}, 900);

setTimeout(() => {
  enterBtn.classList.remove("hidden");
}, 5200);

enterBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <div class="crt"></div>
    <main class="boot-screen">
      <div class="window-bar">
        <span>FREDDIE FIERCE</span>
        <span>ONLINE</span>
      </div>

      <section class="loading-box">
        <h1>WELCOME</h1>
        <div class="logo-placeholder">FF</div>
        <p class="status">HARD HOUSE • PRODUCER • DJ</p>
        <p>MAIN WEBSITE COMING ONLINE...</p>
      </section>
    </main>
  `;
});

const start = document.getElementById("start");
const boot = document.getElementById("boot");
const startBtn = document.getElementById("startBtn");
const enterBtn = document.getElementById("enterBtn");
const linesBox = document.getElementById("lines");
const bar = document.getElementById("bar");
const percent = document.getElementById("percent");

let audio;

function initAudio() {
  audio = new (window.AudioContext || window.webkitAudioContext)();
}

function beep(freq, time = 0.06, type = "square", vol = 0.035) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + time);
}

function clickSound() {
  beep(90, .045, "square", .07);
  setTimeout(() => beep(250, .035, "triangle", .04), 45);
}

function dialup() {
  const notes = [1200, 800, 1600, 600, 2100, 900, 2400, 1300, 700, 1800];
  notes.forEach((n, i) => {
    setTimeout(() => beep(n, .05, "square", .03), i * 90);
  });
}

function staticBurst() {
  for (let i = 0; i < 14; i++) {
    setTimeout(() => beep(200 + Math.random() * 2800, .025, "sawtooth", .018), i * 28);
  }
}

const bootLines = [
  "LOADING WHITE LABEL ARCHIVE",
  "CALIBRATING AUDIO ENGINE",
  "LOCATING DANCEFLOOR",
  "CONNECTING PIRATE FREQUENCY",
  "BUILDING KICK DRUM CACHE",
  "ARMING HOOVER MODULE",
  "CHECKING BASSLINE SIGNAL",
  "SIGNAL LOCKED"
];

startBtn.onclick = () => {
  initAudio();
  clickSound();

  start.classList.add("hidden");
  boot.classList.remove("hidden");

  setTimeout(dialup, 350);
  runBoot();
};

function runBoot() {
  let i = 0;
  let progress = 0;

  const lineTimer = setInterval(() => {
    if (i >= bootLines.length) {
      clearInterval(lineTimer);
      return;
    }

    const row = document.createElement("div");
    row.className = "line";
    row.innerHTML = `<span>&gt; ${bootLines[i]}</span><strong>[OK]</strong>`;
    linesBox.appendChild(row);

    beep(420 + i * 70, .045);

    if (i === 3) staticBurst();
    if (i === 5) dialup();

    i++;
  }, 520);

  const barTimer = setInterval(() => {
    progress += Math.random() * 7.5;

    if (progress >= 100) {
      progress = 100;
      clearInterval(barTimer);

      setTimeout(() => {
        staticBurst();
        beep(520, .08);
        setTimeout(() => beep(760, .08), 120);
        setTimeout(() => beep(1040, .12), 240);
        enterBtn.classList.remove("hidden");
      }, 650);
    }

    bar.style.width = progress + "%";
    percent.textContent = Math.floor(progress) + "%";
  }, 190);
}

document.addEventListener("mouseover", e => {
  if (e.target.tagName === "BUTTON" && audio) {
    beep(900, .025, "square", .018);
  }
});

enterBtn.onclick = () => {
  clickSound();
  document.body.innerHTML = `
    <main class="monitor">
      <section class="start">
        <img src="logo.png" class="logo" alt="Freddie Fierce Logo">
        <h1>FREDDIE FIERCE</h1>
        <p>HARD HOUSE • PRODUCER • DJ</p>
      </section>
    </main>
    <div class="crt"></div>
    <div class="vignette"></div>
  `;
};

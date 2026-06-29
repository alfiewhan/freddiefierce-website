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
  if (!audio) return;

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
  beep(90, 0.045, "square", 0.07);
  setTimeout(() => beep(250, 0.035, "triangle", 0.04), 45);
}

function dialup() {
  const notes = [1200, 800, 1600, 600, 2100, 900, 2400, 1300, 700, 1800];

  notes.forEach((n, i) => {
    setTimeout(() => beep(n, 0.05, "square", 0.03), i * 90);
  });
}

function staticBurst() {
  for (let i = 0; i < 14; i++) {
    setTimeout(() => {
      beep(200 + Math.random() * 2800, 0.025, "sawtooth", 0.018);
    }, i * 28);
  }
}

const bootLines = [
  "LOADING WEBSITE",
  "CALIBRATING AUDIO ENGINE",
  "LOCATING KICK AND BASSLINE",
  "CONNECTING FREQUENCY",
  "HARDER SOUNDS LOCATED",
  "I'LL TAKE YOU THERE, I'LL TAKE YOU THERE",
  "ALMOST FINISHED,
  "SIGNAL FOUND"
];

function runBoot() {
  let i = 0;
  let progress = 0;

  linesBox.innerHTML = "";
  bar.style.width = "0%";
  percent.textContent = "0%";
  enterBtn.classList.add("hidden");

  const lineTimer = setInterval(() => {
    if (i >= bootLines.length) {
      clearInterval(lineTimer);
      return;
    }

    const row = document.createElement("div");
    row.className = "line";
    row.innerHTML = `<span>&gt; ${bootLines[i]}</span><strong>[OK]</strong>`;
    linesBox.appendChild(row);

    beep(420 + i * 70, 0.045);

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
        beep(520, 0.08);
        setTimeout(() => beep(760, 0.08), 120);
        setTimeout(() => beep(1040, 0.12), 240);
        enterBtn.classList.remove("hidden");
      }, 650);
    }

    bar.style.width = progress + "%";
    percent.textContent = Math.floor(progress) + "%";
  }, 190);
}

startBtn.addEventListener("click", () => {
  initAudio();
  clickSound();

  start.classList.add("hidden");
  boot.classList.remove("hidden");

  setTimeout(dialup, 350);
  runBoot();
});

enterBtn.addEventListener("click", () => {
  clickSound();
  staticBurst();

  document.body.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:#000;
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:hidden;
    ">
      <img 
        src="coming-soon.png?v=999"
        alt="Come Back Soon"
        style="
          width:auto !important;
          height:auto !important;
          max-width:62vw !important;
          max-height:62vh !important;
          object-fit:contain !important;
          display:block !important;
        "
      >

      <div style="
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:9999;
        background:repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.12) 0px,
          rgba(255,255,255,0.12) 1px,
          transparent 1px,
          transparent 4px
        );
        opacity:.55;
        animation:scanlinesMove .35s linear infinite;
      "></div>
    </div>
  `;
});

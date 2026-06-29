const startBtn = document.getElementById("startBtn");
const enterBtn = document.getElementById("enterBtn");
const startScreen = document.getElementById("startScreen");
const bootScreen = document.getElementById("bootScreen");
const homeScreen = document.getElementById("homeScreen");
const bootLines = document.getElementById("bootLines");
const bar = document.getElementById("bar");
const percent = document.getElementById("percent");
const connected = document.getElementById("connected");

let audioCtx;

function audioStart() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function beep(freq = 600, duration = 0.08, type = "square", volume = 0.05) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function dialUpBurst() {
  let t = 0;
  const notes = [1200, 900, 1500, 700, 1800, 1000, 2400, 1300, 600, 2100];

  notes.forEach((note, i) => {
    setTimeout(() => beep(note, 0.055, "square", 0.035), t);
    t += 80 + Math.random() * 80;
  });
}

function staticCrackle() {
  for (let i = 0; i < 12; i++) {
    setTimeout(() => beep(200 + Math.random() * 3000, 0.025, "sawtooth", 0.018), i * 35);
  }
}

function heavyClick() {
  beep(90, 0.05, "square", 0.08);
  setTimeout(() => beep(260, 0.035, "triangle", 0.05), 45);
}

function successSound() {
  beep(520, 0.08, "square", 0.05);
  setTimeout(() => beep(760, 0.08, "square", 0.05), 110);
  setTimeout(() => beep(1040, 0.12, "square", 0.05), 220);
}

const lines = [
  "INITIALISING SYSTEM",
  "LOADING WHITE LABEL ARCHIVE",
  "CALIBRATING AUDIO ENGINE",
  "SYNCHRONISING UNDERGROUND NETWORK",
  "LOCATING DANCEFLOOR",
  "CHECKING BASSLINE SIGNAL",
  "ARMING HOOVER MODULE",
  "CONNECTION STABLE"
];

startBtn.addEventListener("click", () => {
  audioStart();
  heavyClick();
  setTimeout(dialUpBurst, 300);

  startScreen.classList.add("hidden");
  bootScreen.classList.remove("hidden");

  runBoot();
});

function runBoot() {
  let progress = 0;
  let lineIndex = 0;

  const lineTimer = setInterval(() => {
    if (lineIndex < lines.length) {
      const row = document.createElement("div");
      row.className = "boot-line";
      row.innerHTML = `<span>&gt; ${lines[lineIndex]}...</span><span>[OK]</span>`;
      bootLines.appendChild(row);

      beep(420 + lineIndex * 70, 0.055, "square", 0.035);

      if (lineIndex === 3) staticCrackle();
      if (lineIndex === 5) dialUpBurst();

      lineIndex++;
    } else {
      clearInterval(lineTimer);
    }
  }, 620);

  const progressTimer = setInterval(() => {
    progress += Math.random() * 8;

    if (progress > 99 && progress < 100) {
      progress = 99;
    }

    if (progress >= 100) {
      progress = 100;
      clearInterval(progressTimer);

      setTimeout(() => {
        connected.classList.remove("hidden");
        successSound();
      }, 600);
    }

    bar.style.width = progress + "%";
    percent.textContent = Math.floor(progress) + "%";
  }, 220);
}

document.addEventListener("mouseover", (e) => {
  if (e.target.classList.contains("big-button") || e.target.classList.contains("menu-button")) {
    if (audioCtx) beep(880, 0.035, "square", 0.025);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("big-button") || e.target.classList.contains("menu-button")) {
    if (audioCtx) heavyClick();
  }
});

enterBtn.addEventListener("click", () => {
  bootScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  staticCrackle();
});

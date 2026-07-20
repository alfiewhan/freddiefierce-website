"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const players = document.querySelectorAll(".hifi-unit");

    let audioContext = null;

    /*
     * Each audio element can only be connected to one
     * MediaElementSourceNode, so we store every connection here.
     */
    const audioSystems = new Map();

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    function getAudioContext() {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                console.warn("Web Audio API is not supported.");
                return null;
            }

            audioContext = new AudioContextClass();
        }

        return audioContext;
    }

    function createAudioSystem(audio) {
        if (audioSystems.has(audio)) {
            return audioSystems.get(audio);
        }

        const context = getAudioContext();

        if (!context) {
            return null;
        }

        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.78;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -18;

        source.connect(analyser);
        analyser.connect(context.destination);

        const system = {
            analyser,
            frequencyData: new Uint8Array(
                analyser.frequencyBinCount
            )
        };

        audioSystems.set(audio, system);

        return system;
    }

    function resetAnalyser(player) {
        const analyserDisplay =
            player.querySelector(".lcd-analyser");

        const bars =
            analyserDisplay?.querySelectorAll("span");

        analyserDisplay?.classList.remove("is-playing");

        bars?.forEach((bar) => {
            bar.classList.remove("is-peak");
            bar.style.removeProperty("height");
            bar.style.removeProperty("filter");
        });
    }

    function stopOtherPlayers(currentAudio) {
        players.forEach((player) => {
            const audio = player.querySelector("audio");
            const button = player.querySelector(".hifi-play");
            const status = player.querySelector(".player-status");

            if (!audio || audio === currentAudio) {
                return;
            }

            if (!audio.paused) {
                audio.pause();
            }

            if (button) {
                button.textContent = "PLAY";
            }

            if (status) {
                status.textContent = "PAUSED";
            }

            resetAnalyser(player);
        });
    }

    function animateAnalyser(player, audio, system) {
        const display =
            player.querySelector(".lcd-analyser");

        const bars = Array.from(
            display?.querySelectorAll("span") || []
        );

        if (!display || bars.length === 0 || !system) {
            return;
        }

        /*
         * Prevent two animation loops from being created for
         * the same player.
         */
        if (display.dataset.animating === "true") {
            return;
        }

        display.dataset.animating = "true";

        function draw() {
            if (audio.paused || audio.ended) {
                display.dataset.animating = "false";
                resetAnalyser(player);
                return;
            }

            system.analyser.getByteFrequencyData(
                system.frequencyData
            );

            /*
             * We focus mainly on the lower and middle frequencies,
             * which gives a chunky old car-stereo response instead
             * of a thin modern spectrum display.
             */
            const usableBins = Math.min(
                system.frequencyData.length,
                72
            );

            const binsPerBar = usableBins / bars.length;

            bars.forEach((bar, index) => {
                const startBin = Math.floor(
                    index * binsPerBar
                );

                const endBin = Math.max(
                    startBin + 1,
                    Math.floor((index + 1) * binsPerBar)
                );

                let total = 0;

                for (
                    let bin = startBin;
                    bin < endBin;
                    bin++
                ) {
                    total += system.frequencyData[bin];
                }

                const average =
                    total / (endBin - startBin);

                /*
                 * Give the display a minimum height so it always
                 * resembles powered-on LCD hardware.
                 */
                const percentage = Math.max(
                    7,
                    Math.min(100, (average / 255) * 118)
                );

                bar.style.height = `${percentage}%`;

                const brightness =
                    0.82 + percentage / 240;

                bar.style.filter =
                    `brightness(${brightness})`;

                bar.classList.toggle(
                    "is-peak",
                    percentage > 76
                );
            });

            requestAnimationFrame(draw);
        }

        draw();
    }

    players.forEach((player) => {
        const button = player.querySelector(".hifi-play");
        const progress = player.querySelector(".hifi-progress");
        const status = player.querySelector(".player-status");
        const timeDisplay = player.querySelector(".lcd-time");

        if (!button || !progress) {
            return;
        }

        const audioId = button.dataset.audio;
        const audio = document.getElementById(audioId);

        if (!audio) {
            console.error(
                `Audio element "${audioId}" could not be found.`
            );

            if (status) {
                status.textContent = "ERROR";
            }

            return;
        }

        button.addEventListener("click", async () => {
            const context = getAudioContext();

            if (context?.state === "suspended") {
                await context.resume();
            }

            const system = createAudioSystem(audio);

            if (audio.paused) {
                stopOtherPlayers(audio);

                try {
                    await audio.play();

                    button.textContent = "PAUSE";

                    if (status) {
                        status.textContent = "PLAYING";
                    }

                    player
                        .querySelector(".lcd-analyser")
                        ?.classList.add("is-playing");

                    animateAnalyser(player, audio, system);

                } catch (error) {
                    console.error(
                        "The audio could not be played:",
                        error
                    );

                    if (status) {
                        status.textContent = "ERROR";
                    }
                }

            } else {
                audio.pause();
                button.textContent = "PLAY";

                if (status) {
                    status.textContent = "PAUSED";
                }

                resetAnalyser(player);
            }
        });

        audio.addEventListener("timeupdate", () => {
            if (Number.isFinite(audio.duration)) {
                progress.value =
                    (audio.currentTime / audio.duration) * 1000;
            }

            if (timeDisplay) {
                timeDisplay.textContent =
                    formatTime(audio.currentTime);
            }
        });

        progress.addEventListener("input", () => {
            if (!Number.isFinite(audio.duration)) {
                return;
            }

            audio.currentTime =
                (Number(progress.value) / 1000) *
                audio.duration;
        });

        audio.addEventListener("ended", () => {
            button.textContent = "PLAY";
            progress.value = 0;

            if (status) {
                status.textContent = "READY";
            }

            if (timeDisplay) {
                timeDisplay.textContent = "00:00";
            }

            resetAnalyser(player);
        });

        audio.addEventListener("error", () => {
            button.textContent = "PLAY";

            if (status) {
                status.textContent = "ERROR";
            }

            resetAnalyser(player);
        });
    });

});

/* =========================================================
   56K STRIPE CONNECTION
   ========================================================= */

const stripePopup = document.getElementById("stripe-popup");
const popupStatus = stripePopup?.querySelector(".popup-status");
const popupMessage = stripePopup?.querySelector(".popup-message");
const popupProgressBar = stripePopup?.querySelector(
    ".popup-progress-bar"
);

const buyButtons = document.querySelectorAll(
    ".download-button"
);

function playModemSound() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    const context = new AudioContextClass();
    const masterGain = context.createGain();

    masterGain.gain.setValueAtTime(
        0.045,
        context.currentTime
    );

    masterGain.connect(context.destination);

    const tones = [
        { time: 0.00, frequency: 440, duration: 0.18 },
        { time: 0.18, frequency: 660, duration: 0.15 },
        { time: 0.33, frequency: 880, duration: 0.12 },
        { time: 0.45, frequency: 520, duration: 0.18 },
        { time: 0.63, frequency: 1200, duration: 0.12 },
        { time: 0.75, frequency: 760, duration: 0.16 }
    ];

    tones.forEach((tone) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = tone.frequency;

        gain.gain.setValueAtTime(
            0,
            context.currentTime + tone.time
        );

        gain.gain.linearRampToValueAtTime(
            0.7,
            context.currentTime + tone.time + 0.01
        );

        gain.gain.linearRampToValueAtTime(
            0,
            context.currentTime +
                tone.time +
                tone.duration
        );

        oscillator.connect(gain);
        gain.connect(masterGain);

        oscillator.start(
            context.currentTime + tone.time
        );

        oscillator.stop(
            context.currentTime +
                tone.time +
                tone.duration
        );
    });

    setTimeout(() => {
        context.close();
    }, 1500);
}

buyButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        const stripeLink = button.href;

        if (
            !stripeLink ||
            !stripeLink.includes("buy.stripe.com")
        ) {
            return;
        }

        event.preventDefault();

        if (!stripePopup) {
            window.location.href = stripeLink;
            return;
        }

        stripePopup.classList.add("is-visible");

        popupProgressBar.style.width = "8%";
        popupStatus.textContent =
            "INITIALISING SECURE CONNECTION...";

        popupMessage.textContent =
            "Preparing modem...";

        playModemSound();

        setTimeout(() => {
            popupProgressBar.style.width = "32%";

            popupStatus.textContent =
                "DIALLING PAYMENT SERVER...";

            popupMessage.textContent =
                "Connecting at 56K...";
        }, 450);

        setTimeout(() => {
            popupProgressBar.style.width = "68%";

            popupStatus.textContent =
                "ESTABLISHING SECURE LINK...";

            popupMessage.textContent =
                "Verifying connection...";
        }, 1050);

        setTimeout(() => {
            popupProgressBar.style.width = "100%";

            popupStatus.textContent =
                "CONNECTION ESTABLISHED";

            popupMessage.textContent =
                "Opening secure checkout...";
        }, 1750);

        setTimeout(() => {
            window.location.href = stripeLink;
        }, 2350);
    });
});
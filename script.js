const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

const introText = document.getElementById("introText");

const logo = new Image();

logo.src = "assets/images/websitelogo.png";


/* ==================================================
   SETTINGS
================================================== */

const settings = {

    // Distance between sampled pixels in the logo.
    // Lower = more particles / more detail.
    sampleGap: 7,

    // Size of each square.
    particleSize: 2.2,

    // Maximum width of assembled logo.
    logoWidth: 760,

    // How quickly particles move toward the logo.
    attraction: 0.055,

    // Slows particles as they approach their target.
    friction: 0.86,

    // Initial scatter distance.
    scatter: 1.25,

    // Random movement while floating.
    drift: 0.12,

    // Delay before assembly begins.
    assemblyDelay: 1200

};


let particles = [];

let assembling = false;
let animationStarted = false;


/* ==================================================
   PARTICLE
================================================== */

class Particle {

    constructor(targetX, targetY) {

        this.targetX = targetX;
        this.targetY = targetY;

        /*
        Start particles scattered around and
        beyond the edges of the screen.
        */

        const side = Math.floor(Math.random() * 4);

        if (side === 0) {

            this.x = Math.random() * canvas.width;
            this.y = -Math.random() * canvas.height * 0.4;

        }

        else if (side === 1) {

            this.x =
                canvas.width +
                Math.random() * canvas.width * 0.4;

            this.y = Math.random() * canvas.height;

        }

        else if (side === 2) {

            this.x = Math.random() * canvas.width;

            this.y =
                canvas.height +
                Math.random() * canvas.height * 0.4;

        }

        else {

            this.x =
                -Math.random() * canvas.width * 0.4;

            this.y = Math.random() * canvas.height;

        }


        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.size =
            settings.particleSize +
            Math.random() * 1.8;

        this.alpha =
            0.25 +
            Math.random() * 0.75;

        this.rotation =
            Math.random() * Math.PI;

        this.rotationSpeed =
            (Math.random() - 0.5) * 0.06;
    }


    update() {

        if (assembling) {

            const dx =
                this.targetX - this.x;

            const dy =
                this.targetY - this.y;


            this.vx +=
                dx * settings.attraction;

            this.vy +=
                dy * settings.attraction;


            this.vx *=
                settings.friction;

            this.vy *=
                settings.friction;

        }

        else {

            /*
            Slight floating movement before
            the particles assemble.
            */

            this.vx +=
                (Math.random() - 0.5) *
                settings.drift;

            this.vy +=
                (Math.random() - 0.5) *
                settings.drift;


            this.vx *= 0.98;
            this.vy *= 0.98;

        }


        this.x += this.vx;
        this.y += this.vy;

        this.rotation +=
            this.rotationSpeed;

    }


    draw() {

        ctx.save();

        ctx.translate(
            this.x,
            this.y
        );

        ctx.rotate(
            this.rotation
        );


        /*
        Slightly warm white rather than
        completely sterile digital white.
        */

        ctx.fillStyle =
            `rgba(235,235,230,${this.alpha})`;


        ctx.fillRect(
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );


        ctx.restore();

    }

}


/* ==================================================
   CANVAS
================================================== */

function resizeCanvas() {

    canvas.width =
        window.innerWidth *
        window.devicePixelRatio;

    canvas.height =
        window.innerHeight *
        window.devicePixelRatio;


    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";


    /*
    Recreate particles whenever dimensions change.
    */

    if (logo.complete && logo.naturalWidth) {

        createLogoParticles();

    }

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* ==================================================
   READ LOGO
================================================== */

function createLogoParticles() {

    particles = [];


    /*
    Temporary canvas used purely to read
    the PNG's visible pixels.
    */

    const tempCanvas =
        document.createElement("canvas");

    const tempCtx =
        tempCanvas.getContext("2d");


    const maxWidth =
        Math.min(
            settings.logoWidth,
            window.innerWidth * 0.72
        );


    const scale =
        maxWidth / logo.naturalWidth;


    const logoWidth =
        logo.naturalWidth * scale;

    const logoHeight =
        logo.naturalHeight * scale;


    tempCanvas.width =
        Math.round(logoWidth);

    tempCanvas.height =
        Math.round(logoHeight);


    tempCtx.drawImage(
        logo,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
    );


    const imageData =
        tempCtx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );


    const data =
        imageData.data;


    /*
    Centre logo on main canvas.
    */

    const offsetX =
        canvas.width / 2 -
        (tempCanvas.width *
        window.devicePixelRatio) / 2;


    const offsetY =
        canvas.height / 2 -
        (tempCanvas.height *
        window.devicePixelRatio) / 2;


    /*
    Sample the PNG.
    */

    for (
        let y = 0;
        y < tempCanvas.height;
        y += settings.sampleGap
    ) {

        for (
            let x = 0;
            x < tempCanvas.width;
            x += settings.sampleGap
        ) {


            const index =
                (y * tempCanvas.width + x) * 4;


            const red =
                data[index];

            const green =
                data[index + 1];

            const blue =
                data[index + 2];

            const alpha =
                data[index + 3];


            /*
            Ignore transparent pixels.

            We also ignore very dark pixels,
            which helps us primarily capture
            the silver/white logo.
            */

            const brightness =
                (red + green + blue) / 3;


            if (
                alpha > 80 &&
                brightness > 75
            ) {

                const targetX =
                    offsetX +
                    x * window.devicePixelRatio;


                const targetY =
                    offsetY +
                    y * window.devicePixelRatio;


                particles.push(
                    new Particle(
                        targetX,
                        targetY
                    )
                );

            }

        }

    }


    console.log(
        "Fierce particles:",
        particles.length
    );

}


/* ==================================================
   ANIMATION
================================================== */

function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
    Very subtle glow behind particles.
    */

    ctx.shadowBlur = 6;
    ctx.shadowColor =
        "rgba(255,255,255,0.18)";


    for (
        let i = 0;
        i < particles.length;
        i++
    ) {

        particles[i].update();
        particles[i].draw();

    }


    requestAnimationFrame(
        animate
    );

}


/* ==================================================
   START
================================================== */

logo.onload = function () {

    resizeCanvas();

    createLogoParticles();

    animate();


    // Start assembling logo

    setTimeout(() => {

        assembling = true;

    }, settings.assemblyDelay);



    // Reveal FREDDIE FIERCE

    setTimeout(() => {

        introText.classList.add(
            "visible"
        );

    }, settings.assemblyDelay + 2400);



    // Fade entire intro away

    setTimeout(() => {

        document
            .getElementById("intro")
            .classList.add("fade-out");

    }, settings.assemblyDelay + 5000);



    // Reveal COMING SOON underneath

    setTimeout(() => {

        document
            .getElementById("comingSoon")
            .classList.add("visible");

    }, settings.assemblyDelay + 5800);

};
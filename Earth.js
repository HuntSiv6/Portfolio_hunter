const starCanvas = document.getElementById("starCanvas");
const sctx = starCanvas ? starCanvas.getContext("2d") : null;

let stars = [];
let starCount = 150;
let shootingStars = [];
let lastSpawn = 0;
let shootingInterval = 3000;

function createStars() {
    if (!starCanvas) return;
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            size: 0.5 + Math.random() * 1.5,
            speed: 0.05 + Math.random() * 0.5
        });
    }
}

function resizeStars() {
    if (!starCanvas) return;
    // match CSS pixels for crispness on high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    starCanvas.width = Math.floor(window.innerWidth * dpr);
    starCanvas.height = Math.floor(window.innerHeight * dpr);
    starCanvas.style.width = window.innerWidth + "px";
    starCanvas.style.height = window.innerHeight + "px";
    if (sctx) sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
}

function spawnShootingStar() {
    if (!starCanvas) return;
    shootingStars.push({
        x: Math.random() * starCanvas.width,
        y: -20,
        length: 120 + Math.random() * 80,
        speed: 8 + Math.random() * 6,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3,
        alpha: 1
    });
}

function animateStars() {
    if (!sctx || !starCanvas) return;
    sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    // draw static stars
    for (let s of stars) {
        s.y -= s.speed;
        if (s.y < 0) s.y = window.innerHeight;
        sctx.fillStyle = "white";
        sctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    // draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.01;
        if (s.alpha <= 0) {
            shootingStars.splice(i, 1);
            continue;
        }
        sctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
        sctx.lineWidth = 2;
        sctx.beginPath();
        sctx.moveTo(s.x, s.y);
        sctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
        sctx.stroke();
    }

    if (Date.now() - lastSpawn > shootingInterval) {
        spawnShootingStar();
        lastSpawn = Date.now();
    }

    requestAnimationFrame(animateStars);
}

// initialize star canvas
resizeStars();
window.addEventListener("resize", resizeStars);
requestAnimationFrame(animateStars);

// --- existing cloud/scroll code continues below ---
const left = document.getElementById("cloud_left");
const right = document.getElementById("cloud_right");
const middle = document.getElementById("middle_cover");

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxFade = window.innerHeight;
    const progress = Math.min(1, scrolled / maxFade);

    // fade out as user scrolls
    const opacity = 1 - progress;
    if (left) left.style.opacity = Math.max(0, opacity);
    if (right) right.style.opacity = Math.max(0, opacity);

    // also fade the middle cover so center reveals as clouds move
    if (middle) {
        middle.style.opacity = String(Math.max(0, opacity));
    }

    // move clouds apart
    const maxShift = 110;
    if (left) left.style.transform = `translateX(${-progress * maxShift}%)`;
    if (right) right.style.transform = `translateX(${progress * maxShift}%)`;
});
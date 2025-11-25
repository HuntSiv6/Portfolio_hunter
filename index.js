const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let starCount = 150;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

for (let i = 0; i < starCount; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: 0.1 + Math.random() * 0.5
    });
}

let shootingStars = [];
let lastSpawn = 0;
let shootingInterval = 3000; // 3 seconds

function spawnShootingStar() {
    shootingStars.push({
        x: Math.random() * canvas.width,
        y: -20,
        length: 100 + Math.random() * 50,
        speed: 8 + Math.random() * 4,
        angle: (Math.PI / 4) + Math.random() * 0.2, 
        alpha: 1
    });
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let s of stars) {
        s.y -= s.speed;
        if (s.y < 0) s.y = canvas.height;

        ctx.fillStyle = "white";
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    for (let s of shootingStars) {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        s.alpha -= 0.01;

        // draw streak
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
            s.x - Math.cos(s.angle) * s.length,
            s.y - Math.sin(s.angle) * s.length
        );
        ctx.stroke();
    }

    // remove faded out stars
    shootingStars = shootingStars.filter(s => s.alpha > 0);

    // spawn new ones
    if (Date.now() - lastSpawn > shootingInterval) {
        spawnShootingStar();
        lastSpawn = Date.now();
    }

    requestAnimationFrame(animateStars);
}

animateStars();

document.addEventListener("DOMContentLoaded", () => {
    const solar = document.querySelector(".solarSystem");
    const earth = document.querySelector(".Earth");
    const orbit1 = document.querySelector(".orbit1");

    earth.style.cursor = "pointer";

    earth.addEventListener("click", () => {

        // Stop animations so Earth stays still
        orbit1.style.animation = "none";
        earth.style.animation = "none";

        // Get Earth position
        const rect = earth.getBoundingClientRect();

        const earthCenterX = rect.left + rect.width / 2;
        const earthCenterY = rect.top + rect.height / 2;

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        // Amount needed to center Earth
        const offsetX = screenCenterX - earthCenterX;
        const offsetY = screenCenterY - earthCenterY;

        // Apply translation + zoom
        solar.style.transition = "transform 1.5s ease";
        solar.style.transform = `
            translate(${offsetX}px, ${offsetY}px)
            scale(4)
        `;

        setTimeout(() => {
            window.location.href = "earth.html";
        }, 1500);
    });
});
earth.addEventListener("click", () => {
    // Stop orbit animations
    orbit1.style.animation = "none";
    earth.style.animation = "none";

    const solarRect = solar.getBoundingClientRect();
    const earthRect = earth.getBoundingClientRect();

    // Center of Earth relative to solarSystem container
    const earthCenterX = earthRect.left + earthRect.width / 2 - solarRect.left;
    const earthCenterY = earthRect.top + earthRect.height / 2 - solarRect.top;

    const containerCenterX = solarRect.width / 2;
    const containerCenterY = solarRect.height / 2;

    const offsetX = containerCenterX - earthCenterX;
    const offsetY = containerCenterY - earthCenterY;

    // Make transform origin center so scaling zooms properly
    solar.style.transformOrigin = "center center";

    // Apply translation + zoom
    solar.style.transition = "transform 1.5s ease";
    solar.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(4)`;

    // Redirect after animation
    setTimeout(() => {
        window.location.href = "earth.html";
    }, 1500);
});


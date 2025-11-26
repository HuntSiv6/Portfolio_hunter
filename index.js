const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let starCount = 150;
let shootingStars = [];
let lastSpawn = 0;
let shootingInterval = 3000; // 3 seconds

// create / populate stars array for current canvas size
function createStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: 0.1 + Math.random() * 0.5
        });
    }
}

function resize() {
    // make the canvas match the viewport (fixed fullscreen)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // recreate stars to fill new size
    createStars();
}
resize();
window.addEventListener('resize', resize);

// spawn shooting star uses canvas dimensions so it always starts off-screen top
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
        if (s.y < 0) s.y = canvas.height; // wrap within canvas height
        ctx.fillStyle = "white";
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    for (let s of shootingStars) {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.01;

        ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
            s.x - Math.cos(s.angle) * s.length,
            s.y - Math.sin(s.angle) * s.length
        );
        ctx.stroke();
    }

    shootingStars = shootingStars.filter(s => s.alpha > 0);

    if (Date.now() - lastSpawn > shootingInterval) {
        spawnShootingStar();
        lastSpawn = Date.now();
    }

    requestAnimationFrame(animateStars);
}
animateStars();

document.addEventListener("DOMContentLoaded", () => {

    // helper: freeze animations on orbits/planets
    function freezeScene() {
        document.querySelectorAll('.orbit, .planet').forEach(el => {
            const comp = getComputedStyle(el).transform;
            if (comp && comp !== 'none') el.style.transform = comp;
            el.style.animation = 'none';
        });
    }

    // generic zoom + cloud transition for a planet element
    function triggerPlanetZoom(planetEl, leftImgUrl, rightImgUrl, middleCoverColor, targetUrl) {
        freezeScene();

        const solar = document.querySelector('.solarSystem');
        const rect = planetEl.getBoundingClientRect();
        const earthCenterX = rect.left + rect.width / 2;
        const earthCenterY = rect.top + rect.height / 2;
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const offsetX = screenCenterX - earthCenterX;
        const offsetY = screenCenterY - earthCenterY;

        const solarRect = solar.getBoundingClientRect();
        const originX = earthCenterX - solarRect.left;
        const originY = earthCenterY - solarRect.top;
        solar.style.transformOrigin = `${originX}px ${originY}px`;

        // compute target scale (same logic as Earth)
        const requiredScaleX = window.innerWidth / rect.width;
        const requiredScaleY = window.innerHeight / rect.height;
        const requiredScale = Math.max(requiredScaleX, requiredScaleY);
        const extraZoomMultiplier = 3;
        const targetScale = requiredScale * extraZoomMultiplier;

        // create overlays if missing
        if (!document.getElementById('transition_cloud_left')) {
            const left = document.createElement('div');
            left.id = 'transition_cloud_left';
            Object.assign(left.style, {
                position: 'fixed', top: '0', left: '0',
                width: '55%', height: '100%',
                backgroundImage: `url("${leftImgUrl}")`,
                backgroundSize: 'cover', backgroundPosition: 'left center',
                pointerEvents: 'none', opacity: '0', transform: 'translateX(-110%)',
                zIndex: 9999
            });
            const right = document.createElement('div');
            right.id = 'transition_cloud_right';
            Object.assign(right.style, {
                position: 'fixed', top: '0', right: '0',
                width: '55%', height: '100%',
                backgroundImage: `url("${rightImgUrl}")`,
                backgroundSize: 'cover', backgroundPosition: 'right center',
                pointerEvents: 'none', opacity: '0', transform: 'translateX(110%)',
                zIndex: 9999
            });
            const mid = document.createElement('div');
            mid.id = 'transition_middle_cover';
            Object.assign(mid.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: middleCoverColor, pointerEvents: 'none', opacity: '0', zIndex: 9998
            });
            document.body.appendChild(mid);
            document.body.appendChild(left);
            document.body.appendChild(right);
        }

        const cloudL = document.getElementById('transition_cloud_left');
        const cloudR = document.getElementById('transition_cloud_right');
        const midCover = document.getElementById('transition_middle_cover');

        // update middle cover color for this planet
        if (midCover) {
            midCover.style.backgroundColor = middleCoverColor;
        }

        const durationMs = 2000;
        const easing = 'cubic-bezier(.22,.9,.32,1)';
        const finishRatio = 0.6;
        const cloudFadeDuration = Math.round(durationMs * finishRatio);

        // ensure start state
        cloudL.style.opacity = '0';
        cloudR.style.opacity = '0';
        cloudL.style.transform = 'translateX(-110%)';
        cloudR.style.transform = 'translateX(110%)';
        cloudL.style.backgroundImage = `url("${leftImgUrl}")`;
        cloudR.style.backgroundImage = `url("${rightImgUrl}")`;
        if (midCover) midCover.style.opacity = '0';

        // force reflow
        void cloudL.offsetWidth;

        // set transitions (clouds finish sooner than full zoom)
        cloudL.style.transition = `opacity ${cloudFadeDuration}ms ease, transform ${cloudFadeDuration}ms ${easing}`;
        cloudR.style.transition = `opacity ${cloudFadeDuration}ms ease, transform ${cloudFadeDuration}ms ${easing}`;
        if (midCover) midCover.style.transition = `opacity ${cloudFadeDuration}ms ease`;

        // start clouds/mid immediately on click (move in + fade in)
        cloudL.style.transform = 'translateX(0)';
        cloudR.style.transform = 'translateX(0)';
        cloudL.style.opacity = '1';
        cloudR.style.opacity = '1';
        if (midCover) midCover.style.opacity = '1';

        // start zoom (full duration)
        solar.style.transition = `transform ${durationMs}ms ${easing}`;
        solar.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${targetScale})`;

        // navigate when zoom ends
        const onEnd = (e) => {
            if (e.propertyName === 'transform') {
                solar.removeEventListener('transitionend', onEnd);
                if (targetUrl) window.location.href = targetUrl;
            }
        };
        solar.addEventListener('transitionend', onEnd);
        setTimeout(() => {
            solar.removeEventListener('transitionend', onEnd);
            if (targetUrl) window.location.href = targetUrl;
        }, durationMs + 300);
    }

    // attach for Earth, Mars, Jupiter
    const earth = document.querySelector('.Earth');
    const mars = document.querySelector('.Mars');
    const jupiter = document.querySelector('.Jupiter');

    if (earth) {
        earth.style.cursor = 'pointer';
        earth.addEventListener('click', () => {
            triggerPlanetZoom(earth, 'images/cloud_left.PNG', 'images/cloud_right.PNG', '#E3E3E3', 'Earth.html');
        });
    }

    if (mars) {
        mars.style.cursor = 'pointer';
        mars.addEventListener('click', () => {
            triggerPlanetZoom(mars, 'images/mars_left.PNG', 'images/mars_right.PNG', '#c77569', 'Mars.html');
        });
    }

    if (jupiter) {
        jupiter.style.cursor = 'pointer';
        jupiter.addEventListener('click', () => {
            triggerPlanetZoom(jupiter, 'images/jup_left.PNG', 'images/jup_right.PNG', '#dbb274', 'Jupiter.html');
        });
    }

});


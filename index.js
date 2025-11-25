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
        // freeze animations
        const orbitComputed = getComputedStyle(orbit1).transform;
        if (orbitComputed && orbitComputed !== "none") orbit1.style.transform = orbitComputed;
        orbit1.style.animation = "none";

        const earthComputed = getComputedStyle(earth).transform;
        if (earthComputed && earthComputed !== "none") earth.style.transform = earthComputed;
        earth.style.animation = "none";

        // earth position and offsets
        const rect = earth.getBoundingClientRect();
        const earthCenterX = rect.left + rect.width / 2;
        const earthCenterY = rect.top + rect.height / 2;
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const offsetX = screenCenterX - earthCenterX;
        const offsetY = screenCenterY - earthCenterY;

        // set transform-origin to the earth's center (local coords)
        const solarRect = solar.getBoundingClientRect();
        const originX = earthCenterX - solarRect.left;
        const originY = earthCenterY - solarRect.top;
        solar.style.transformOrigin = `${originX}px ${originY}px`;

        // compute scale so earth engulfs screen
        const requiredScaleX = window.innerWidth / rect.width;
        const requiredScaleY = window.innerHeight / rect.height;
        const requiredScale = Math.max(requiredScaleX, requiredScaleY);
        const extraZoomMultiplier = 3; // stronger zoom
        const targetScale = requiredScale * extraZoomMultiplier;

        // create cloud overlays + middle cover if missing (start off-screen / invisible)
        function ensureCloudOverlay() {
            if (document.getElementById('transition_cloud_left')) return;

            const left = document.createElement('div');
            left.id = 'transition_cloud_left';
            Object.assign(left.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '55%',
                height: '100%',
                backgroundImage: 'url("images/cloud_left.PNG")',
                backgroundSize: 'cover',
                backgroundPosition: 'left center',
                pointerEvents: 'none',
                opacity: '0',
                transform: 'translateX(-110%)',
                zIndex: 9999
            });

            const right = document.createElement('div');
            right.id = 'transition_cloud_right';
            Object.assign(right.style, {
                position: 'fixed',
                top: '0',
                right: '0',
                width: '55%',
                height: '100%',
                backgroundImage: 'url("images/cloud_right.PNG")',
                backgroundSize: 'cover',
                backgroundPosition: 'right center',
                pointerEvents: 'none',
                opacity: '0',
                transform: 'translateX(110%)',
                zIndex: 9999
            });

            // middle cover (full-screen and behind clouds)
            const mid = document.createElement('div');
            mid.id = 'transition_middle_cover';
            Object.assign(mid.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                transform: 'none',
                width: '100%',            
                height: '100%',
                backgroundColor: '#E3E3E3',
                pointerEvents: 'none',
                opacity: '0',
                zIndex: 9998             // below clouds
            });

            document.body.appendChild(mid);
            document.body.appendChild(left);
            document.body.appendChild(right);
        }

        ensureCloudOverlay();
        const cloudL = document.getElementById('transition_cloud_left');
        const cloudR = document.getElementById('transition_cloud_right');
        const midCover = document.getElementById('transition_middle_cover');

        const durationMs = 2000; // full zoom duration
        const easing = 'cubic-bezier(.22,.9,.32,1)';

        //clouds + middle cover finish moving quicker than the full zoom.
        // They will complete at ~60% of the zoom so the covers are already at full opacity
        const finishRatio = 0.6;
        const cloudFadeDuration = Math.round(durationMs * finishRatio); 
        const cloudTransformDuration = cloudFadeDuration; // move-in matches fade completion

        // ensure starting state (offscreen + invisible)
        cloudL.style.opacity = '0';
        cloudR.style.opacity = '0';
        cloudL.style.transform = 'translateX(-110%)';
        cloudR.style.transform = 'translateX(110%)';
        if (midCover) {
            midCover.style.opacity = '0';
        }

        // force reflow so transitions take
        void cloudL.offsetWidth;

        // set transitions:
        // clouds: opacity finishes sooner than the full zoom, transform also finishes sooner
        cloudL.style.transition = `opacity ${cloudFadeDuration}ms ease, transform ${cloudTransformDuration}ms ${easing}`;
        cloudR.style.transition = `opacity ${cloudFadeDuration}ms ease, transform ${cloudTransformDuration}ms ${easing}`;

        // middle cover fades in 
        if (midCover) {
            midCover.style.transition = `opacity ${cloudFadeDuration}ms ease`;
        }

        // start animations immediately on click: clouds move inward and fade; middle cover fades in
        cloudL.style.transform = 'translateX(0)';
        cloudR.style.transform = 'translateX(0)';
        cloudL.style.opacity = '1';
        cloudR.style.opacity = '1';
        if (midCover) midCover.style.opacity = '1';

        // zoom (translate + scale) runs full duration so clouds/mid finish earlier
        solar.style.transition = `transform ${durationMs}ms ${easing}`;
        solar.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${targetScale})`;

        // navigate when zoom ends (fallback timeout)
        const onEnd = (e) => {
            if (e.propertyName === 'transform') {
                solar.removeEventListener('transitionend', onEnd);
                window.location.href = 'Earth.html';
            }
        };
        solar.addEventListener('transitionend', onEnd);
        setTimeout(() => {
            solar.removeEventListener('transitionend', onEnd);
            window.location.href = 'Earth.html';
        }, durationMs + 300);
    });
});


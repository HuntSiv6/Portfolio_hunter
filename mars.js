const left = document.getElementById("cloud_left");
const right = document.getElementById("cloud_right");
const middle = document.getElementById("middle_cover");

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxFade = window.innerHeight;
    const progress = Math.min(1, scrolled / maxFade);

    // fade out as user scrolls
    const opacity = 1 - progress;
    left.style.opacity = Math.max(0, opacity);
    right.style.opacity = Math.max(0, opacity);

    // also fade the middle cover so center reveals as clouds move
    if (middle) {
        middle.style.opacity = String(Math.max(0, opacity));
    }

    // move clouds apart
    const maxShift = 110;
    left.style.transform = `translateX(${-progress * maxShift}%)`;
    right.style.transform = `translateX(${progress * maxShift}%)`;
});
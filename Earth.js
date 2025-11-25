window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxFade = window.innerHeight; // clouds fade in one screen height
    const opacity = 1 - (scrolled / maxFade);

    document.getElementById("clouds").style.opacity = Math.max(0, opacity);
});

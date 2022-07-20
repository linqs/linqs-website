'use strict';

window.linqs = window.linqs || {};
window.linqs.home = window.linqs.home || {};

window.linqs.home.INTERVAL_MS = 5000;
window.linqs.home.currentIndex = 0;

window.linqs.home.changeCarousel = function() {
    window.linqs.home.currentIndex++;

    let imgs = document.querySelectorAll(".carousel-area img");
    imgs[(window.linqs.home.currentIndex - 1) % imgs.length].classList = 'fade-out';
    imgs[window.linqs.home.currentIndex % imgs.length].classList = 'fade-in';
}

window.linqs.home.startCarousel = function() {
    let imgs = document.querySelectorAll(".carousel-area img");
    imgs[0].classList = 'fade-first';
    setInterval(window.linqs.home.changeCarousel, window.linqs.home.INTERVAL_MS);
}
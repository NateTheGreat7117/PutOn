const stickyDivs = document.querySelectorAll('.overlay-text');
const images = document.querySelectorAll('.main-image');

window.addEventListener("scroll", () => {
    const imageRect = images[0].getBoundingClientRect();
    const divRect = stickyDivs[0].getBoundingClientRect();

    // When bottom of image is within 30px of sticky div bottom
    if (window.innerHeight - divRect.bottom - 80 <= window.innerHeight - imageRect.bottom) {
        stickyDivs.forEach(el => {
            el.style.position = 'absolute'; // change position
            el.style.top = 'auto';               // remove top
        });
    } 
    
    if (stickyDivs[0].style.position == 'absolute' && window.innerHeight - divRect.bottom <= 79.5 && true) {
        stickyDivs.forEach(el => {
            el.style.position = 'sticky'; // change position
            el.style.top = '30px';               // remove top
        });
    }
});
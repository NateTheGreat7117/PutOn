import loadImages, { resizeGridItem } from '/assets/js/components/load-images.js';



// Underline current explore page category
const pages = document.querySelectorAll(".page");
const underline = document.querySelector(".underline");

function moveUnderline(p) {
    const { offsetLeft, offsetWidth } = p;

    // Make underline half the width
    const newWidth = offsetWidth / 2;

    // Center it under the text
    const newLeft = offsetLeft + (offsetWidth / 2) - (newWidth / 2);

    underline.style.width = newWidth + 'px';
    underline.style.left = newLeft + 'px';
    p.style.color = "black";
}

moveUnderline(pages[0]);

pages.forEach((p) => {
    p.addEventListener("click", () => {
        moveUnderline(p);

        for (let i = 0; i < pages.length; i++) {
            if (i != Array.from(pages).indexOf(p)) {
                pages[i].style.color = "rgb(91, 89, 89)";
            }
        }
    })
})



// Exit single image view
const grid = document.querySelector(".grid");
const infoScreen = document.querySelector(".image-info-screen");
const mainImage = document.querySelector(".placeholder-img");
const backButton = document.querySelector(".back-button");

let imageElements = [];

loadImages().then((images) => {
    imageElements = images;
    images.forEach((i) => {
        i.addEventListener("click", function () {
            grid.style.display = "none";
            infoScreen.style.display = "flex";

            mainImage.src = this.src;
            mainImage.style.display = "block";
        });
    });
});

backButton.addEventListener("click", function() {
    grid.style.display = "grid";
    infoScreen.style.display = "none";
    mainImage.style.display = "none";

    mainImage.src = "/assets/images/icons/placeholder.jpg";
    
    // Force recalculation of grid item spans after a short delay
    setTimeout(() => {
        imageElements.forEach(img => {
            if (img && img.getBoundingClientRect) {
                resizeGridItem(img);
            }
        });
    }, 50);
});



// Close filter side bar
const filterToggle = document.getElementById('filterToggle');
const filterSidebar = document.querySelector('.filter-side-bar');

filterToggle.addEventListener('click', () => {
    filterSidebar.classList.toggle('collapsed');
    // Change arrow direction
    filterToggle.textContent = filterSidebar.classList.contains('collapsed') ? '→' : '←';
});
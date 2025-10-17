import loadImages from '/assets/js/components/load-images.js';

const grid = document.querySelector(".grid");
const infoScreen = document.querySelector(".image-info-screen");
const mainImage = document.querySelector(".placeholder-img");
const backButton = document.querySelector(".back-button");

loadImages().then((images) => {
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
    grid.style.display = "block";
    infoScreen.style.display = "none";
    mainImage.style.display = "none";

    mainImage.src = "/assets/images/icons/placeholder.jpg";
});
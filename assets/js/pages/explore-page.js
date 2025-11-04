import loadImages, { resizeGridItem } from '/assets/js/components/load-images.js';

const pages = document.querySelectorAll(".page");
const underline = document.querySelector(".underline");

function moveUnderline(p) {
    const { offsetLeft, offsetWidth } = p;
    const newWidth = offsetWidth / 2;
    const newLeft = offsetLeft + (offsetWidth / 2) - (newWidth / 2);

    underline.style.width = newWidth + 'px';
    underline.style.left = newLeft + 'px';
    p.style.color = "black";
}

let imageElements = [];
const grid = document.querySelector(".grid");
const infoScreen = document.querySelector(".image-info-screen");
const mainImage = document.querySelector(".placeholder-img");
const backButton = document.querySelector(".back-button");

// Load the first page (small) by default
let currentPage = "fyp";
loadPageImages({ page: [currentPage] });

// Move underline to first page
moveUnderline(pages[0]);

pages.forEach((p, index) => {
    p.addEventListener("click", async () => {
        moveUnderline(p);

        pages.forEach(page => (page.style.color = "rgb(91, 89, 89)"));
        p.style.color = "black";

        // Pick the size based on which page index
        if (index === 0) currentPage = "fyp";
        else if (index === 1) currentPage = "friends";
        else if (index === 2) currentPage = "brandoftheday";
        else if (index === 3) currentPage = "following";
        else if (index === 4) currentPage = "trending";
        await loadPageImages({ page: [currentPage] });

        grid.style.display = "grid";
        infoScreen.style.display = "none";
        mainImage.style.display = "none";
        mainImage.src = "/assets/images/icons/placeholder.jpg";
    });
});

async function loadPageImages(selectedFilters) {
    const imageInfoScreen = document.querySelector(".image-info-screen");
    const placeholderImg = document.querySelector(".placeholder-img");
    const reel = document.querySelector(".image-reel");
    
    if (reel) reel.remove();
    placeholderImg.src = "/assets/images/icons/placeholder.jpg";
    imageInfoScreen.classList.remove("active");

    // Pass the filters object directly
    console.log(selectedFilters);
    imageElements = await loadImages(selectedFilters);

    imageElements.forEach((img) => {
        img.addEventListener("click", function () {
            grid.style.display = "none";
            infoScreen.style.display = "flex";
            mainImage.src = this.src;
            mainImage.style.display = "block";
        });
    });
}

backButton.addEventListener("click", function() {
    grid.style.display = "grid";
    infoScreen.style.display = "none";
    mainImage.style.display = "none";
    mainImage.src = "/assets/images/icons/placeholder.jpg";

    setTimeout(() => {
        imageElements.forEach(img => resizeGridItem(img));
    }, 50);
});

// Sidebar toggle
const filterToggle = document.getElementById('filterToggle');
const filterSidebar = document.querySelector('.filter-side-bar');
filterToggle.addEventListener('click', () => {
    filterSidebar.classList.toggle('collapsed');
    filterToggle.textContent = filterSidebar.classList.contains('collapsed') ? '→' : '←';
});

// Filters
const filters = document.querySelectorAll(".choice input");

filters.forEach((filter) => {
  filter.addEventListener("change", async () => {
    const selectedFilters = {page: [currentPage]}; // { Gender: ["Men"], Style: ["Streetwear", "Date night"], ... }

    filters.forEach((f) => {
      if (f.checked) {
        const category = f.closest(".choices").previousElementSibling.textContent.trim();
        const subCategory = f.nextElementSibling.textContent.trim();

        // Initialize array if first time
        if (!selectedFilters[category]) {
          selectedFilters[category] = [];
        }

        selectedFilters[category].push(subCategory);
      }
    });

    // Send object to loadPageImages
    await loadPageImages(selectedFilters);

    grid.style.display = "grid";
    infoScreen.style.display = "none";
    mainImage.style.display = "none";
    mainImage.src = "/assets/images/icons/placeholder.jpg";
  });
});

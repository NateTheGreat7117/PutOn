function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default async function loadImages() {
    const response = await fetch("/data/images.json");
    let images = await response.json();
    images = shuffleArray(images);
    const gallery = document.getElementById("gallery");
    
    const imageElements = [];
    
    images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("grid-image");
        gallery.appendChild(img);
        imageElements.push(img);
        
        // Calculate grid row span after image loads
        img.addEventListener('load', function() {
            resizeGridItem(img);
        });
    });
    
    // Recalculate on window resize or sidebar toggle
    window.addEventListener('resize', () => {
        imageElements.forEach(img => resizeGridItem(img));
    });
    
    // Watch for sidebar toggle (when columns change)
    const observer = new MutationObserver(() => {
        setTimeout(() => {
            imageElements.forEach(img => resizeGridItem(img));
        }, 100);
    });
    
    const sidebar = document.querySelector('.filter-side-bar');
    if (sidebar) {
        observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    
    return imageElements;
}

function resizeGridItem(item) {
    const grid = document.getElementById("gallery");
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    const rowSpan = Math.ceil((item.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = "span " + rowSpan;
}

export { resizeGridItem };
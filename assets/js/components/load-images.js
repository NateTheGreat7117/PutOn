export default async function loadImages() {
    const response = await fetch("/data/images.json");
    const images = await response.json();
    const gallery = document.getElementById("gallery");
    
    const imageElements = [];

    images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("grid-image");
        gallery.appendChild(img);
        imageElements.push(img);
    });

    return imageElements;
}

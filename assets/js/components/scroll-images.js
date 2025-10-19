// Filter toggle functionality
const filterToggle = document.getElementById('filterToggle');
const filterSidebar = document.querySelector('.filter-side-bar');

filterToggle.addEventListener('click', () => {
    filterSidebar.classList.toggle('collapsed');
    // Change arrow direction
    filterToggle.textContent = filterSidebar.classList.contains('collapsed') ? '→' : '←';
});

document.addEventListener("DOMContentLoaded", () => {
const gallery = document.querySelector("#gallery");
const imageInfoScreen = document.querySelector(".image-info-screen");
const imageHalf = imageInfoScreen.querySelector(".image-half");
const placeholderImg = imageInfoScreen.querySelector(".placeholder-img");
const backButton = imageInfoScreen.querySelector(".back-button");
const overlay = document.querySelector(".overlay");
const clothingDetails = document.getElementById("clothingDetails");

let images = [];
let currentIndex = -1;
let isScrolling = false;
let reel = null;

// ========================================
// AI CLOTHING DETECTION FUNCTION - UPDATED
// ========================================
async function detectClothing(imageUrl) {
    // Show loading state
    clothingDetails.innerHTML = `
    <div class="ai-analyzing">
        <div class="spinner"></div>
        <span>Analyzing clothing items...</span>
    </div>
    `;

    try {
    // Make sure URL is complete
    const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : window.location.origin + imageUrl;

    console.log('🔍 Sending image to AI:', fullImageUrl);

    // Call our backend API
    const response = await fetch('http://localhost:3000/api/detect-clothing', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: fullImageUrl })
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Received detection results:', data);
    
    if (data.success && data.items && data.items.length > 0) {
        displayClothingItems(data.items);
    } else {
        clothingDetails.innerHTML = `
        <h2>No Clothing Detected</h2>
        <p>No clothing items were identified in this image.</p>
        `;
    }
    
    } catch (error) {
    console.error('❌ Detection error:', error);
    clothingDetails.innerHTML = `
        <h2>Connection Error</h2>
        <p>Could not connect to the detection service.</p>
        <p style="color: #999; font-size: 12px;">Make sure the backend server is running on port 3000.</p>
        <p style="color: #999; font-size: 12px;">Error: ${error.message}</p>
    `;
    }
}

// Display detected clothing items in a grid layout
function displayClothingItems(items) {
    let html = '<h2>Detected Clothing Items</h2>';
    
    if (items.length === 0) {
    html += '<p>No clothing items detected in this image.</p>';
    } else {
    html += '<div class="clothing-grid">';
    items.forEach((item, index) => {
        html += `
        <div class="clothing-item">
            <h3>${item.type}</h3>
            <p><strong>Item:</strong> ${item.name}</p>
            <p class="brand"><strong>Brand:</strong> ${item.brand}</p>
            <p><strong>Color:</strong> ${item.color}</p>
            <p><strong>Size:</strong> ${item.size}</p>
            <p class="price">${item.price}</p>
            ${item.confidence ? `<p style="font-size: 11px; color: #999;">Confidence: ${item.confidence}%</p>` : ''}
        </div>
        `;
    });
    html += '</div>';
    }

    html += `
    <div class="info-section">
        <h2>About This Detection</h2>
        <p>These items were detected using AI image recognition technology. Results may vary based on image quality.</p>
    </div>
    `;

    clothingDetails.innerHTML = html;
}

// Wait for dynamically loaded images
const observer = new MutationObserver(() => {
    images = Array.from(gallery.querySelectorAll("img"));
    images.forEach((img, index) => {
    img.addEventListener("click", () => openImage(index));
    });
});
observer.observe(gallery, { childList: true, subtree: true });

// Fallback if images already exist
setTimeout(() => {
    images = Array.from(gallery.querySelectorAll("img"));
    images.forEach((img, index) => {
    img.addEventListener("click", () => openImage(index));
    });
}, 1000);

function createReel() {
    reel = document.createElement('div');
    reel.className = 'image-reel';
    
    // Create all image elements in the reel
    images.forEach((img, index) => {
    const reelImageContainer = document.createElement('div');
    reelImageContainer.className = 'reel-image';
    
    const reelImg = document.createElement('img');
    reelImg.src = img.src;
    
    reelImageContainer.appendChild(reelImg);
    reelImageContainer.style.top = `${index * 100}%`;
    reel.appendChild(reelImageContainer);
    });
    
    imageHalf.appendChild(reel);
    
    // Hide the original placeholder
    placeholderImg.style.opacity = '0';
    placeholderImg.style.pointerEvents = 'none';
}

function openImage(index) {
    if (!reel) {
    createReel();
    }
    
    currentIndex = index;
    
    // Position the reel to show the current image
    reel.style.transform = `translateY(-${currentIndex * 100}%)`;
    
    // Fade in current image, fade out others
    const reelImages = reel.querySelectorAll('.reel-image');
    reelImages.forEach((container, i) => {
    if (i === currentIndex) {
        container.classList.add('active');
    } else {
        container.classList.remove('active');
    }
    });
    
    // Run AI detection on the current image
    detectClothing(images[currentIndex].src);
    
    imageInfoScreen.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeImage() {
    imageInfoScreen.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

function showNextImage() {
    if (currentIndex < images.length - 1 && !isScrolling) {
    isScrolling = true;
    currentIndex++;
    
    const reelImages = reel.querySelectorAll('.reel-image');
    
    // Fade out current, fade in next
    reelImages[currentIndex - 1].classList.remove('active');
    reelImages[currentIndex].classList.add('active');
    
    // Scroll the reel
    reel.style.transform = `translateY(-${currentIndex * 100}%)`;
    
    // Run AI detection on new image
    detectClothing(images[currentIndex].src);
    
    setTimeout(() => {
        isScrolling = false;
    }, 200);
    }
}

function showPrevImage() {
    if (currentIndex > 0 && !isScrolling) {
    isScrolling = true;
    currentIndex--;
    
    const reelImages = reel.querySelectorAll('.reel-image');
    
    // Fade out current, fade in previous
    reelImages[currentIndex + 1].classList.remove('active');
    reelImages[currentIndex].classList.add('active');
    
    // Scroll the reel
    reel.style.transform = `translateY(-${currentIndex * 100}%)`;
    
    // Run AI detection on new image
    detectClothing(images[currentIndex].src);
    
    setTimeout(() => {
        isScrolling = false;
    }, 200);
    }
}

// Scroll wheel navigation
imageInfoScreen.addEventListener("wheel", (e) => {
    if (!imageInfoScreen.classList.contains("active")) return;
    e.preventDefault();
    if (e.deltaY > 0) showNextImage();
    else if (e.deltaY < 0) showPrevImage();
});

// Arrow key navigation
document.addEventListener("keydown", (e) => {
    if (!imageInfoScreen.classList.contains("active")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") showNextImage();
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") showPrevImage();
    else if (e.key === "Escape") closeImage();
});

// Close events
backButton.addEventListener("click", closeImage);
overlay.addEventListener("click", closeImage);
});
// Background transition on hover
const logoContainer = document.getElementById('logoContainer');

if (logoContainer) {
logoContainer.addEventListener('mouseenter', () => {
    document.body.classList.add('logo-hovered');
});

logoContainer.addEventListener('mouseleave', () => {
    document.body.classList.remove('logo-hovered');
});
}

// 3D tilt effect
const trackingGrid = document.getElementById('trackingGrid');
const logoCard = document.getElementById('logoCard');

if (trackingGrid && logoCard) {
// Create 10x10 grid of tracking cells for smoother transitions
const gridSize = 10;
const maxRotX = 20;
const maxRotY = 10;

for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    // Calculate rotation based on position in grid
    // Map row 0-9 to rotX 20 to -20
    // Map col 0-9 to rotY -10 to 10
    const rotX = maxRotX - (row / (gridSize - 1)) * (maxRotX * 2);
    const rotY = -maxRotY + (col / (gridSize - 1)) * (maxRotY * 2);

    cell.addEventListener('mouseenter', () => {
        logoCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    trackingGrid.appendChild(cell);
    }
}

// Reset on mouse leave
logoContainer.addEventListener('mouseleave', () => {
    logoCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
});
}
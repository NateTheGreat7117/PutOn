// Drag and Drop Functionality
const itemCards = document.querySelectorAll('.item-card');
const wardrobeSlots = document.querySelectorAll('.wardrobe-slot');
let draggedItem = null;

// ========================================
// LOAD SAVED ITEMS FROM LOCALSTORAGE
// ========================================
function loadPutOns() {
    try {
        const savedItems = JSON.parse(localStorage.getItem('putOns') || '[]');
        const putOnsGrid = document.getElementById('putOns');
        
        console.log('🔍 Loading Put-Ons...');
        console.log('📦 Found items in localStorage:', savedItems.length);
        console.log('📝 Items data:', savedItems);
        
        if (savedItems.length === 0) {
            console.log('ℹ️ No saved items found');
            putOnsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No items yet. Add items from the Explore page!</p>';
            return;
        }
        
        console.log(`✅ Loading ${savedItems.length} saved items`);
        
        // Clear existing sample items
        putOnsGrid.innerHTML = '';
        
        // Add each saved item
        savedItems.forEach((item, index) => {
            console.log(`\n🎨 Creating card ${index + 1}:`, item);
            const itemCard = createItemCard(item);
            putOnsGrid.appendChild(itemCard);
        });
        
        // Re-initialize drag handlers for new items
        initializeDragHandlers();
        
    } catch (error) {
        console.error('❌ Error loading saved items:', error);
    }
}

// ========================================
// CREATE ITEM CARD ELEMENT
// ========================================
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.draggable = true;
    
    // Map item type to category
    const category = mapTypeToCategory(item.type);
    card.dataset.category = category;
    card.dataset.item = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
    
    // Create image element
    const img = document.createElement('img');
    
    // Use base64 imageData first (this will work across pages), then fallback to URLs
    const imageUrl = item.imageData || item.imageSrc || item.sourceImage || item.image;
    
    console.log('🖼️ Creating card for:', item.name);
    console.log('📸 Image source type:', item.imageData ? 'base64' : 'url');
    console.log('📏 Image data length:', imageUrl ? imageUrl.length : 0);
    
    if (imageUrl) {
        img.src = imageUrl;
    } else {
        console.warn('⚠️ No image data found for item:', item.name);
        img.src = '/assets/images/icons/placeholder.jpg';
    }
    
    img.alt = item.name;
    img.onerror = function() {
        console.error('❌ Failed to load image for:', item.name);
        console.log('🔄 Using placeholder instead');
        this.src = '/assets/images/icons/placeholder.jpg';
    };
    
    img.onload = function() {
        console.log('✅ Image loaded successfully:', item.name);
    };
    
    // Create name element
    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-item-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Remove item';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteItem(item.id, card);
    };
    
    card.appendChild(deleteBtn);
    card.appendChild(img);
    card.appendChild(name);
    
    return card;
}

// ========================================
// MAP CLOTHING TYPE TO CATEGORY
// ========================================
function mapTypeToCategory(type) {
    const typeMap = {
        'jacket': 'outerwear',
        'coat': 'outerwear',
        'hoodie': 'outerwear',
        'sweater': 'outerwear',
        't-shirt': 'shirt',
        'shirt': 'shirt',
        'blouse': 'shirt',
        'top': 'shirt',
        'jeans': 'pants',
        'pants': 'pants',
        'trousers': 'pants',
        'shorts': 'pants',
        'skirt': 'pants',
        'sneakers': 'shoes',
        'boots': 'shoes',
        'shoes': 'shoes',
        'sandals': 'shoes',
        'hat': 'accessories',
        'bag': 'accessories',
        'watch': 'accessories',
        'sunglasses': 'accessories',
        'jewelry': 'accessories'
    };
    
    const lowerType = type.toLowerCase();
    return typeMap[lowerType] || 'shirt'; // Default to shirt if unknown
}

// ========================================
// DELETE ITEM
// ========================================
function deleteItem(itemId, cardElement) {
    if (!confirm('Remove this item from Put-Ons?')) {
        return;
    }
    
    try {
        const savedItems = JSON.parse(localStorage.getItem('putOns') || '[]');
        const updatedItems = savedItems.filter(item => item.id !== itemId);
        localStorage.setItem('putOns', JSON.stringify(updatedItems));
        
        // Remove from DOM with animation
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.transform = 'scale(0)';
        cardElement.style.opacity = '0';
        
        setTimeout(() => {
            cardElement.remove();
        }, 300);
        
        console.log('✅ Item deleted');
    } catch (error) {
        console.error('❌ Error deleting item:', error);
    }
}

// ========================================
// INITIALIZE DRAG HANDLERS
// ========================================
function initializeDragHandlers() {
    const allItemCards = document.querySelectorAll('.item-card');
    
    allItemCards.forEach(card => {
        // Remove old listeners by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
    
    // Add new listeners
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedItem = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
            draggedItem = null;
        });
        
        // Re-attach delete button handler
        const deleteBtn = card.querySelector('.delete-item-btn');
        if (deleteBtn) {
            const itemId = card.dataset.item;
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                // Find the actual item ID from localStorage
                const savedItems = JSON.parse(localStorage.getItem('putOns') || '[]');
                const item = savedItems.find(i => 
                    (i.id && i.id.toString() === itemId) || 
                    i.name.toLowerCase().replace(/\s+/g, '-') === itemId
                );
                if (item) {
                    deleteItem(item.id, card);
                }
            };
        }
    });
}

// ========================================
// SLOT DROP EVENTS
// ========================================
wardrobeSlots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', (e) => {
        slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        if (draggedItem) {
            const itemCategory = draggedItem.dataset.category;
            const slotType = slot.dataset.slot;
            
            // Clear placeholder
            const placeholder = slot.querySelector('.slot-placeholder');
            if (placeholder) placeholder.remove();
            
            // Clear existing item if any
            const existingItem = slot.querySelector('.slot-item');
            if (existingItem) existingItem.remove();
            
            // Clone and add item image
            const itemImg = draggedItem.querySelector('img');
            if (itemImg) {
                const newImg = itemImg.cloneNode(true);
                newImg.classList.add('slot-item');
                slot.appendChild(newImg);
                slot.classList.add('has-item');
            }
        }
    });

    // Click to remove item
    slot.addEventListener('click', (e) => {
        if (slot.classList.contains('has-item')) {
            const itemImg = slot.querySelector('.slot-item');
            if (itemImg) itemImg.remove();
            
            slot.classList.remove('has-item');
            
            // Add placeholder back
            if (!slot.querySelector('.slot-placeholder')) {
                const placeholder = document.createElement('span');
                placeholder.className = 'slot-placeholder';
                placeholder.textContent = `Drop ${slot.dataset.slot} here`;
                slot.appendChild(placeholder);
            }
        }
    });
});

// ========================================
// FILTER FUNCTIONALITY
// ========================================
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.closest('.collection-card');
        const btns = parent.querySelectorAll('.filter-btn');
        const grid = parent.querySelector('.items-grid');
        const category = btn.dataset.category;
        
        // Update active state
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter items
        const items = grid.querySelectorAll('.item-card');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Upload function (placeholder)
function uploadPiece() {
    alert('Upload functionality would open a file picker here. Connect this to your backend upload system.');
    // You would implement actual file upload logic here
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Build Outfit page loaded');
    
    // Debug: Check what's in localStorage
    console.log('🔍 Checking localStorage...');
    const putOnsData = localStorage.getItem('putOns');
    console.log('📦 Raw putOns data:', putOnsData);
    
    if (putOnsData) {
        try {
            const parsed = JSON.parse(putOnsData);
            console.log('✅ Parsed putOns data:', parsed);
            console.log('📊 Number of items:', parsed.length);
        } catch (e) {
            console.error('❌ Error parsing putOns data:', e);
        }
    } else {
        console.log('⚠️ No putOns data found in localStorage');
    }
    
    loadPutOns();
});

// Also load when page becomes visible (in case items were added in another tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('👁️ Page became visible, reloading items...');
        loadPutOns();
    }
});

// Debug function - you can call this in the console
window.debugPutOns = function() {
    console.log('=== PUT-ONS DEBUG ===');
    const data = localStorage.getItem('putOns');
    console.log('Raw data:', data);
    if (data) {
        const parsed = JSON.parse(data);
        console.log('Parsed:', parsed);
        console.log('Count:', parsed.length);
        parsed.forEach((item, i) => {
            console.log(`Item ${i}:`, item.name, 'has image:', !!item.imageData);
        });
    }
    console.log('===================');
};

// Test function to manually reload
window.reloadPutOns = function() {
    console.log('🔄 Manually reloading Put-Ons...');
    loadPutOns();
};
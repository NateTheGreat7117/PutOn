let currentTab = 'posts';

// Get tab from URL parameter
function getTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'posts';
}

// Update URL with current tab
function updateURL(tab) {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
}

// Go back to profile
function goBack() {
    window.location.href = '/pages/profile.html';
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    currentTab = tab;
    
    // Update active button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update URL
    updateURL(tab);

    // Load posts for the selected tab
    loadPosts(tab);
}

// Load posts based on tab
async function loadPosts(tab) {
    const postsGrid = document.getElementById('postsGrid');
    postsGrid.innerHTML = '<div class="loading">Loading posts...</div>';

    let endpoint = '';
    switch(tab) {
        case 'posts':
            endpoint = '/api/posts';
            break;
        case 'liked':
            endpoint = '/api/posts/liked';
            break;
        case 'saved':
            endpoint = '/api/posts/saved';
            break;
        case 'reposted':
            endpoint = '/api/posts/reposted';
            break;
    }

    try {
        const response = await fetch(endpoint, { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.posts.length > 0) {
            displayPosts(data.posts, tab);
            updatePostCount(data.posts.length);
        } else {
            showEmptyMessage(tab);
            updatePostCount(0);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postsGrid.innerHTML = '<div class="empty-message"><p>Error loading posts</p><small>Please try again later</small></div>';
    }
}

// Display posts in grid
function displayPosts(posts, tab) {
    const postsGrid = document.getElementById('postsGrid');
    postsGrid.innerHTML = '';

    posts.forEach(post => {
        const postWrapper = document.createElement('div');
        postWrapper.className = 'post-item-wrapper';

        const postUrl = post.url || post.post_url;
        const canDelete = tab === 'posts';

        postWrapper.innerHTML = `
            <div class="canvas">
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
            </div>
            <div class="post-item" onclick="viewPost('${postUrl}')">
                <img src="${postUrl}" alt="${post.caption || 'Post'}">
                ${canDelete ? `
                    <div class="post-overlay">
                        <button class="delete-post-btn" onclick="event.stopPropagation(); deletePost('${postUrl}', this)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        postsGrid.appendChild(postWrapper);
    });
}

// View post detail
function viewPost(postUrl) {
    window.location.href = `/?view=${encodeURIComponent(postUrl)}`;
}

// Delete post
async function deletePost(postUrl, button) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    const filename = postUrl.split('/').pop();

    try {
        const response = await fetch(`/api/posts/${filename}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const postWrapper = button.closest('.post-item-wrapper');
            postWrapper.style.transition = 'all 0.3s';
            postWrapper.style.opacity = '0';
            postWrapper.style.transform = 'scale(0.8)';

            setTimeout(() => {
                postWrapper.remove();

                const remainingPosts = document.querySelectorAll('.post-item-wrapper');
                if (remainingPosts.length === 0) {
                    showEmptyMessage(currentTab);
                }
                updatePostCount(remainingPosts.length);
            }, 300);
        } else {
            alert('Failed to delete post: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
    }
}

// Show empty message
function showEmptyMessage(tab) {
    const postsGrid = document.getElementById('postsGrid');
    let message = '';
    
    switch(tab) {
        case 'posts':
            message = '<p>No posts yet</p><small>Create your first post!</small>';
            break;
        case 'liked':
            message = '<p>No liked posts yet</p><small>Like posts to see them here</small>';
            break;
        case 'saved':
            message = '<p>No saved posts yet</p><small>Save posts to see them here</small>';
            break;
        case 'reposted':
            message = '<p>No reposted posts yet</p><small>Repost content to see it here</small>';
            break;
    }

    postsGrid.innerHTML = `<div class="empty-message">${message}</div>`;
}

// Update post count
function updatePostCount(count) {
    const postsCount = document.getElementById('postsCount');
    postsCount.textContent = `${count} post${count !== 1 ? 's' : ''}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialTab = getTabFromURL();
    switchTab(initialTab);
});
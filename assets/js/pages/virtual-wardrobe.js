function switchTab(event, tab) {
    // Remove active class from all buttons
    document.querySelectorAll('.posts-toggle button').forEach(btn => {
    btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // In a real app, you would load different content here
    console.log('Switched to:', tab);
}
// Check if user is already logged in
if (localStorage.getItem('currentUser')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // Only redirect if user has appropriate role
    if (currentUser.role === 'Owner' || currentUser.role === 'Co-Owner') {
        window.location.href = 'index.html';
    }
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// Load users from localStorage or initialize with default admin
let users = JSON.parse(localStorage.getItem('users')) || [
    {
        username: 'BigBlueChips',
        password: 'Bluelion26$', // In a real application, this should be hashed
        role: 'Owner'
    },
    {
        username: 'NinjaClanGreenNinja',
        password: 'Blacklion26$', // In a real application, this should be hashed
        role: 'Co-Owner'
    },
    {
        username: 'Selarise',
        password: 'Selarise1234',
        role: 'Owner'
    },
    {
        username: 'Overseer',
        password: 'Overseer1234',
        role: 'Co-Owner'
    },
    {
        username: 'Cracky',
        password: 'Cracky1234',
        role: 'Co-Owner'
    }
];

// Save users to localStorage if not already saved
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Find user
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
        // Check if user has appropriate role
        if (user.role === 'Owner' || user.role === 'Co-Owner') {
            // Store current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                role: user.role
            }));
            
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            // Show error message for insufficient permissions
            errorMessage.textContent = 'You do not have permission to access this tool.';
            errorMessage.style.display = 'block';
        }
    } else {
        // Show error message for invalid credentials
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.style.display = 'block';
    }
}); 
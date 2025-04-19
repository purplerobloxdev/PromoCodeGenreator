// Check if user is logged in and has appropriate role
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || (currentUser.role !== 'Owner' && currentUser.role !== 'Co-Owner')) {
    window.location.href = 'login.html';
}

// Load existing codes from localStorage or initialize empty array
let promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];

// Load initial data from codes.json if no codes exist in localStorage
if (promoCodes.length === 0) {
    fetch('codes.json')
        .then(response => response.json())
        .then(data => {
            promoCodes = data.promoCodes;
            saveCodes();
            renderCodes();
        })
        .catch(error => console.log('Error loading initial codes:', error));
}

// DOM Elements
const promoForm = document.getElementById('promoForm');
const codesListContainer = document.getElementById('codesList');
const exportButton = document.getElementById('exportCSV');
const userDisplay = document.createElement('div');
userDisplay.className = 'user-display';
document.querySelector('header').appendChild(userDisplay);

// Display current user
function displayUser() {
    userDisplay.innerHTML = `
        <span>Welcome, ${currentUser.username} (${currentUser.role})</span>
        <button onclick="logout()" class="btn-logout">Logout</button>
    `;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Generate random alphanumeric code
function generateUniqueCode(prefix = '') {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = Math.floor(Math.random() * (12 - 6 + 1)) + 6; // Random length between 6-12
    let code;
    
    do {
        code = prefix;
        for (let i = 0; i < codeLength; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    } while (promoCodes.some(promo => promo.code === code)); // Ensure uniqueness

    return code;
}

// Format date for display
function formatDate(date) {
    return date ? new Date(date).toLocaleDateString() : 'No expiration';
}

// Save codes to localStorage
function saveCodes() {
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
}

// Add new promo code
function addPromoCode(e) {
    e.preventDefault();

    const formData = new FormData(promoForm);
    const prefix = formData.get('prefix');
    const code = generateUniqueCode(prefix);
    
    // Get the expiration date and format it properly
    const expirationDate = formData.get('expiration');
    const formattedExpiration = expirationDate ? new Date(expirationDate).toISOString().split('T')[0] : null;
    
    const promoData = {
        code,
        rewardType: formData.get('rewardType'),
        creator: currentUser.username, // Use logged-in username
        expiration: formattedExpiration,
        notes: formData.get('notes'),
        createdAt: new Date().toISOString()
    };

    promoCodes.unshift(promoData); // Add to beginning of array
    saveCodes();
    renderCodes();
    promoForm.reset();
}

// Copy code to clipboard
function copyToClipboard(code) {
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector(`[data-code="${code}"]`);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1500);
    });
}

// Render codes list
function renderCodes() {
    codesListContainer.innerHTML = promoCodes.map(promo => `
        <div class="code-item">
            <div class="code-header">
                <span class="code-value">${promo.code}</span>
                <button class="copy-btn" data-code="${promo.code}" onclick="copyToClipboard('${promo.code}')">
                    Copy Code
                </button>
            </div>
            <div class="code-details">
                <p><strong>Reward:</strong> ${promo.rewardType}</p>
                <p><strong>Creator:</strong> ${promo.creator}</p>
                <p><strong>Expiration:</strong> ${formatDate(promo.expiration)}</p>
                ${promo.notes ? `<p><strong>Notes:</strong> ${promo.notes}</p>` : ''}
                <p><small>Created: ${new Date(promo.createdAt).toLocaleString()}</small></p>
            </div>
        </div>
    `).join('');
}

// Export to CSV
function exportToCSV() {
    const headers = ['Code', 'Reward Type', 'Creator', 'Expiration', 'Notes', 'Created At'];
    const csvContent = [
        headers.join(','),
        ...promoCodes.map(promo => [
            promo.code,
            promo.rewardType,
            promo.creator,
            promo.expiration || 'No expiration',
            `"${promo.notes || ''}"`,
            new Date(promo.createdAt).toLocaleString()
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `promo-codes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
promoForm.addEventListener('submit', addPromoCode);
exportButton.addEventListener('click', exportToCSV);

// Initial render
displayUser();
renderCodes(); 
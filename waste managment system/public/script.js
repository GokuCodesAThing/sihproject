// Global variables
let currentUser = null;
let isAdmin = false;

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const adminLoginModal = document.getElementById('adminLoginModal');
const wasteRequestModal = document.getElementById('wasteRequestModal');
const dashboard = document.getElementById('dashboard');
const adminDashboard = document.getElementById('adminDashboard');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupMobileMenu();
});

// Check if user is logged in
async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (data.loggedIn) {
            currentUser = {
                id: data.userId,
                username: data.username,
                isAdmin: data.isAdmin
            };
            isAdmin = data.isAdmin;
            updateUIForLoggedInUser();
            
            if (isAdmin) {
                showAdminDashboard();
                loadAllRequests();
            } else {
                showUserDashboard();
                loadMyRequests();
            }
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Modal triggers
    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    logoutBtn.addEventListener('click', handleLogout);
    
    // Request pickup button
    document.getElementById('requestPickupBtn').addEventListener('click', () => {
        if (currentUser) {
            showModal(wasteRequestModal);
        } else {
            showModal(loginModal);
        }
    });
    
    // New request button
    document.getElementById('newRequestBtn').addEventListener('click', () => {
        showModal(wasteRequestModal);
    });
    
    // Modal navigation
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });
    
    document.getElementById('showAdminLogin').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(adminLoginModal);
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('wasteRequestForm').addEventListener('submit', handleWasteRequest);
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
}

// Setup mobile menu
function setupMobileMenu() {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Modal functions
function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    
    if (isAdmin) {
        document.getElementById('userName').textContent = currentUser.username;
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    
    // Hide dashboards
    dashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
}

// Show user dashboard
function showUserDashboard() {
    dashboard.style.display = 'block';
    adminDashboard.style.display = 'none';
    document.getElementById('userName').textContent = currentUser.username;
}

// Show admin dashboard
function showAdminDashboard() {
    adminDashboard.style.display = 'block';
    dashboard.style.display = 'none';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            isAdmin = false;
            updateUIForLoggedInUser();
            showUserDashboard();
            loadMyRequests();
            hideModal(loginModal);
            showNotification('Login successful!', 'success');
            document.getElementById('loginForm').reset();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const fullName = document.getElementById('regFullName').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                fullName,
                phone,
                address,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Registration successful! Please login.', 'success');
            hideModal(registerModal);
            showModal(loginModal);
            document.getElementById('registerForm').reset();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.admin;
            isAdmin = true;
            updateUIForLoggedInUser();
            showAdminDashboard();
            loadAllRequests();
            hideModal(adminLoginModal);
            showNotification('Admin login successful!', 'success');
            document.getElementById('adminLoginForm').reset();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Admin login failed. Please try again.', 'error');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            isAdmin = false;
            updateUIForLoggedOutUser();
            showNotification('Logged out successfully!', 'success');
        }
    } catch (error) {
        showNotification('Logout failed. Please try again.', 'error');
    }
}

// Handle waste request
async function handleWasteRequest(e) {
    e.preventDefault();
    
    const wasteType = document.getElementById('wasteType').value;
    const quantity = document.getElementById('quantity').value;
    const pickupDate = document.getElementById('pickupDate').value;
    const description = document.getElementById('description').value;
    
    try {
        const response = await fetch('/api/waste-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wasteType,
                quantity,
                pickupDate,
                description
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Waste collection request submitted successfully!', 'success');
            hideModal(wasteRequestModal);
            document.getElementById('wasteRequestForm').reset();
            
            // Reload requests
            if (isAdmin) {
                loadAllRequests();
            } else {
                loadMyRequests();
            }
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Failed to submit request. Please try again.', 'error');
    }
}

// Load user's requests
async function loadMyRequests() {
    try {
        const response = await fetch('/api/my-requests');
        const data = await response.json();
        
        if (data.requests) {
            displayMyRequests(data.requests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Load all requests (admin)
async function loadAllRequests() {
    try {
        const response = await fetch('/api/all-requests');
        const data = await response.json();
        
        if (data.requests) {
            displayAllRequests(data.requests);
            updateStatistics(data.requests);
        }
    } catch (error) {
        console.error('Error loading all requests:', error);
    }
}

// Display user's requests
function displayMyRequests(requests) {
    const container = document.getElementById('myRequestsList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No requests found. Submit your first waste collection request!</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-item">
            <h4>${request.waste_type.charAt(0).toUpperCase() + request.waste_type.slice(1)} Waste</h4>
            <p><strong>Quantity:</strong> ${request.quantity}</p>
            <p><strong>Pickup Date:</strong> ${formatDate(request.pickup_date)}</p>
            <p><strong>Status:</strong> <span class="request-status status-${request.status}">${request.status}</span></p>
            <p><strong>Submitted:</strong> ${formatDate(request.created_at)}</p>
            ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
        </div>
    `).join('');
}

// Display all requests (admin)
function displayAllRequests(requests) {
    const container = document.getElementById('allRequestsList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No requests found.</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-item">
            <h4>${request.waste_type.charAt(0).toUpperCase() + request.waste_type.slice(1)} Waste</h4>
            <p><strong>User:</strong> ${request.full_name} (${request.username})</p>
            <p><strong>Contact:</strong> ${request.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${request.address || 'N/A'}</p>
            <p><strong>Quantity:</strong> ${request.quantity}</p>
            <p><strong>Pickup Date:</strong> ${formatDate(request.pickup_date)}</p>
            <p><strong>Status:</strong> 
                <select onchange="updateRequestStatus(${request.id}, this.value)" class="status-select">
                    <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="approved" ${request.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="rejected" ${request.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </p>
            <p><strong>Submitted:</strong> ${formatDate(request.created_at)}</p>
            ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
        </div>
    `).join('');
}

// Update request status (admin)
async function updateRequestStatus(requestId, newStatus) {
    try {
        const response = await fetch(`/api/request/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Status updated successfully!', 'success');
            loadAllRequests(); // Reload to update statistics
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Failed to update status. Please try again.', 'error');
    }
}

// Update statistics
function updateStatistics(requests) {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    
    document.getElementById('totalRequests').textContent = total;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('completedRequests').textContent = completed;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Set minimum date for pickup date input
document.addEventListener('DOMContentLoaded', function() {
    const pickupDateInput = document.getElementById('pickupDate');
    const today = new Date().toISOString().split('T')[0];
    pickupDateInput.min = today;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some CSS for status select
const style = document.createElement('style');
style.textContent = `
    .status-select {
        padding: 0.3rem 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        font-size: 0.8rem;
    }
    
    .status-select:focus {
        outline: none;
        border-color: #2ecc71;
    }
`;
document.head.appendChild(style);

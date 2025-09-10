const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'waste-management-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Database setup
const db = new sqlite3.Database('waste_management.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Waste collection requests table
    db.run(`CREATE TABLE IF NOT EXISTS waste_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        waste_type TEXT NOT NULL,
        quantity TEXT NOT NULL,
        description TEXT,
        pickup_date TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user
    const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO admins (username, email, password) VALUES (?, ?, ?)`,
        ['admin', 'admin@wastemanagement.com', defaultAdminPassword]);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, fullName, phone, address } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(`INSERT INTO users (username, email, password, full_name, phone, address) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, fullName, phone, address],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(500).json({ error: 'Registration failed' });
                }
                res.json({ success: true, message: 'User registered successfully', userId: this.lastID });
            });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }
        
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.adminId = admin.id;
        req.session.isAdmin = true;
        
        res.json({ 
            success: true, 
            message: 'Admin login successful',
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });
    });
});

// Submit waste collection request
app.post('/api/waste-request', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please login first' });
    }
    
    const { wasteType, quantity, description, pickupDate } = req.body;
    
    db.run(`INSERT INTO waste_requests (user_id, waste_type, quantity, description, pickup_date) 
            VALUES (?, ?, ?, ?, ?)`,
        [req.session.userId, wasteType, quantity, description, pickupDate],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to submit request' });
            }
            res.json({ success: true, message: 'Waste collection request submitted successfully', requestId: this.lastID });
        });
});

// Get user's waste requests
app.get('/api/my-requests', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please login first' });
    }
    
    db.all('SELECT * FROM waste_requests WHERE user_id = ? ORDER BY created_at DESC', 
        [req.session.userId], (err, requests) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch requests' });
            }
            res.json({ requests });
        });
});

// Get all waste requests (admin only)
app.get('/api/all-requests', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }
    
    db.all(`SELECT wr.*, u.username, u.full_name, u.phone, u.address 
            FROM waste_requests wr 
            JOIN users u ON wr.user_id = u.id 
            ORDER BY wr.created_at DESC`, (err, requests) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch requests' });
        }
        res.json({ requests });
    });
});

// Update request status (admin only)
app.put('/api/request/:id/status', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    db.run('UPDATE waste_requests SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update status' });
        }
        res.json({ success: true, message: 'Status updated successfully' });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check session
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            loggedIn: true, 
            userId: req.session.userId, 
            username: req.session.username,
            isAdmin: req.session.isAdmin || false
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.listen(PORT, () => {
    console.log(`Waste Management System running on http://localhost:${PORT}`);
});

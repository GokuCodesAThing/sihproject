# Waste Management System

A comprehensive, user-friendly waste management system built with Node.js, Express, SQLite, HTML, CSS, and JavaScript. This system provides an efficient platform for managing waste collection requests with both user and admin interfaces.

## Features

### 🏠 User Features
- **User Registration & Login**: Secure user authentication with password hashing
- **Waste Collection Requests**: Submit requests for different types of waste
- **Request Tracking**: View status and history of submitted requests
- **User Dashboard**: Personal dashboard to manage requests
- **Responsive Design**: Mobile-friendly interface

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive overview of all requests
- **Request Management**: Approve, reject, or mark requests as completed
- **Statistics**: Real-time statistics on total, pending, and completed requests
- **User Information**: View detailed user information for each request

### 🗂️ Waste Types Supported
- Household Waste
- Recyclable Materials
- Hazardous Waste
- Electronic Waste
- Organic Waste

### 📱 Modern UI/UX
- Clean, modern design with gradient backgrounds
- Smooth animations and transitions
- Modal-based forms for better user experience
- Real-time notifications
- Responsive design for all devices

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: bcryptjs for password hashing
- **Sessions**: express-session for user sessions
- **Styling**: Custom CSS with modern design patterns

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step 1: Clone or Download
```bash
# If using git
git clone <repository-url>
cd waste-management-system

# Or download and extract the files
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Default Admin Credentials

The system comes with a default admin account:
- **Username**: admin
- **Password**: admin123

**⚠️ Important**: Change these credentials after first login for security.

## Usage Guide

### For Users

1. **Registration**: Click "Register" to create a new account
2. **Login**: Use your credentials to log in
3. **Submit Request**: Click "Request Pickup" to submit a waste collection request
4. **Track Requests**: View your request history and status in the dashboard

### For Admins

1. **Admin Login**: Use admin credentials to access admin panel
2. **View Requests**: See all submitted requests with user details
3. **Manage Status**: Update request status (pending, approved, completed, rejected)
4. **Monitor Statistics**: View real-time statistics on the admin dashboard

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/logout` - Logout
- `GET /api/session` - Check session status

### Waste Requests
- `POST /api/waste-request` - Submit waste collection request
- `GET /api/my-requests` - Get user's requests
- `GET /api/all-requests` - Get all requests (admin only)
- `PUT /api/request/:id/status` - Update request status (admin only)

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- full_name
- phone
- address
- created_at

### Waste Requests Table
- id (Primary Key)
- user_id (Foreign Key)
- waste_type
- quantity
- description
- pickup_date
- status
- created_at

### Admins Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- created_at

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **Session Management**: Secure session handling with express-session
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Cross-origin resource sharing protection

## File Structure

```
waste-management-system/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── public/               # Frontend files
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── script.js         # Frontend JavaScript
└── waste_management.db   # SQLite database (created automatically)
```

## Customization

### Styling
- Modify `public/styles.css` to change the appearance
- Update color schemes, fonts, and layout as needed

### Features
- Add new waste types in the HTML select options
- Extend the database schema for additional fields
- Add new API endpoints for additional functionality

### Database
- The SQLite database is created automatically on first run
- For production, consider using PostgreSQL or MySQL

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change the port in server.js
   const PORT = process.env.PORT || 3001;
   ```

2. **Database Issues**
   - Delete `waste_management.db` and restart the server
   - The database will be recreated automatically

3. **Module Not Found Errors**
   ```bash
   # Reinstall dependencies
   npm install
   ```

4. **Permission Issues**
   - Ensure you have write permissions in the project directory
   - Run with appropriate user permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions:
- Create an issue in the repository
- Contact the development team

## Future Enhancements

- Email notifications for request status updates
- SMS integration for pickup reminders
- Mobile app development
- Advanced analytics and reporting
- Integration with GPS for route optimization
- Payment processing for premium services
- Multi-language support
- Advanced user roles and permissions

---

**Note**: This is a demonstration project. For production use, implement additional security measures, proper error handling, and consider using a more robust database system.

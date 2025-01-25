
# MERN Application

## Overview
This project is a full-stack web application built using the MERN stack. The application provides functionality for managing bookings, signing up for calendar events, sending email notifications, and a secure payment system.

I am currently in the process of finalizing, then Dockerizing and deploying this application. The expected deployment date is 01/31/2025.

- **MongoDB**: A NoSQL database for storing application data.
- **Express.js**: A Node.js framework for building the backend API.
- **React**: A JavaScript library for building the user interface.
- **Node.js**: A runtime environment for executing JavaScript code on the server.

---

## Features

- **User Authentication and Authorization**:
  - Sign up, login, and role-based access (admin and user).
- **CRUD Functionality**:
  - Create, read, update, and delete bookings, events, and more.
- **Real-Time Updates**:
  - Powered by Socket.IO for dynamic changes.
- **Integration with Third-Party APIs**:
  - PayPal for secure payments.
  - SendGrid for email notifications.
- **Responsive Design**:
  - Optimized for mobile and desktop.
- **Payment Integration with PayPal**:
  - Secure checkout process for users.
- **Email Notifications with SendGrid**:
  - Email authentication for registration and login.
  - Automated booking confirmation emails for both users and admins.

---

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org) (version 14 or higher).
- [MongoDB](https://www.mongodb.com) (local or cloud setup).
- [React.js](https://react.dev/) 
- [Express.js](https://expressjs.com/)
- [Git](https://git-scm.com)

### Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

#### 2. Install Dependencies

##### For the backend:
```bash
cd server
npm install
```

##### For the frontend:
```bash
cd client
npm install
```

#### 3. Set Up Environment Variables
Create a `.env` file in the `server` directory with the following variables:
```plaintext
PORT=5001
MONGO_URI=your_mongo_connection_string
ADMIN_EMAIL=email_used_for_admin_login
ADMIN_PASSWORD=password_used_for_admin_login
REFRESH_TOKEN_SECRET=token_based_authentication
EMAIL_USER=authentication_with_SendGrid
EMAIL_PASS=authentication_with_SendGrid
EMAIL_RECEIVER=default_recipient_for_system-level_emails
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

#### 4. Run the Application

##### Start the backend server:
```bash
cd server
npm run server
```

##### Start the frontend development server:
```bash
cd ..
npm start
```

#### 5. Access the Application
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
root/
├── client/       # React frontend
│   ├── public/   # Static assets
│   ├── src/      # React components, pages, and utilities
│   ├── config/   # passport.js to implement OAuth
├── server/       # Node.js backend
│   ├── models/   # Mongoose schemas
│   ├── routes/   # API routes
│   ├── scripts/  # Utility scripts to create an admin user and for database seeding
│   ├── middleware/ # Authentication and error handling
├── README.md     # Project documentation
├── .env          # Environment variables
├── package.json  # Dependencies for the root
```

---

## Technologies Used

### Frontend
- React.js
- Axios (for API calls)
- React Router DOM (for routing)

### Backend
- Node.js
- Express.js
- Mongoose (MongoDB ORM)
- JWT (JSON Web Tokens for authentication)

### Additional Tools
- Socket.IO (for real-time updates).
- SCSS Modules (for styling).

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or collaboration, please contact:

- **Name**: Zsuzsanna Mangu
- **Email**: zsuzsannamangu@gmail.com
- **GitHub**: https://github.com/zsuzsannamangu/
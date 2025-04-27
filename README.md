
# MERN Application

## Overview
This project is a full-stack web application built using the MERN stack. The application provides functionality for managing bookings, signing up for calendar events, sending email notifications, and a secure payment system.

- **MongoDB**: A NoSQL database for storing application data.
- **Express.js**: A Node.js framework for building the backend API.
- **React**: A JavaScript library for building the user interface.
- **Node.js**: A runtime environment for executing JavaScript code on the server.

---

## Features

- **User Authentication and Authorization**:
  - Sign up, login, and role-based access (admin and user).
  - OAuth 2.0 login via Google account.
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
git clone https://github.com/zsuzsannamangu/mern-yoga-hub
cd mern-yoga-hub
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
MONGO_URI=mongodb://<db-username>:<db-password>@<ec2-ip>:27017/mern-yogahub?authSource=admin
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
GOOGLE_CLIENT_ID=for_oauth_login
GOOGLE_CLIENT_SECRET=for_oauth_login
RECAPTCHA_SECRET_KEY
CLIENT_URL
SERVER_URL
```
Create a `.env` file in the `client` directory with the following variables:
```plaintext
REACT_APP_API=https://connect.yogaandchocolate.com
REACT_APP_CAPTCHA_SITE_KEY=your_google_recaptcha_site_key
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
- Passport.js (OAuth 2.0 strategy for Google login)

### Additional Tools
- Socket.IO (for real-time updates).
- SCSS Modules (for styling).
- SendGrid (email notifications)
- PayPal SDK (payment processing)
- Google reCAPTCHA v3 (spam protection)

### Deployment Overview

This application uses a cloud-based distributed deployment:
- Frontend: Hosted on Vercel — https://yogaandchocolate.com
- Backend: Hosted on Render — https://connect.yogaandchocolate.com
- Database: MongoDB Community Edition hosted on an AWS EC2 instance (self-managed)

Domain and subdomain DNS are managed via Namecheap.

### Deployment Notes
- Frontend and backend are hosted separately and communicate securely over HTTPS.
- MongoDB runs on EC2 and accepts connections only from trusted IPs (Render backend, optionally admin IP).
- Backend on Render automatically binds to the system-provided $PORT environment variable.
- OAuth, API calls, and domain redirects are configured to work with connect.yogaandchocolate.com.
- DNS setup (on Namecheap):
  - @ (root domain) → Vercel IP address
  - www (CNAME) → Vercel
  - connect (CNAME) → Render

### Security Considerations
- Port exposure: Only ports 22 (SSH) and 27017 (MongoDB) are open on EC2.
- MongoDB authentication: Admin and application users are configured with strong passwords.
- Environment variables: Sensitive credentials are securely stored in hosting providers (Vercel, Render).
- Backups: MongoDB database dumps can be scheduled to AWS S3 for disaster recovery (recommended).

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or collaboration, please contact:

- **Name**: Zsuzsanna Mangu
- **Email**: zsuzsannamangu@gmail.com
- **GitHub**: https://github.com/zsuzsannamangu/

**Deployed on:** 🚀 [Vercel](https://vercel.com/) (Frontend) • [Render](https://render.com/) (Backend) • AWS EC2 (MongoDB)



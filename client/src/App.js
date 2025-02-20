import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; //// BrowserRouter for routing, Routes for defining routes, and Route for individual route declarations
// Authentication providers for managing user and admin authentication contexts
import { UserAuthProvider } from './components/User/UserAuthContext';
import { AdminAuthProvider } from './components/Admin/AdminAuthContext';
import './App.scss'; // Main stylesheet

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';

// Pages
import Home from './components/Home/Home';
import Contact from './components/Contact/Contact';
import About from './components/About/About';
import Calendar from './components/Calendar/Calendar';
import Chocolates from './components/Chocolates/Chocolates';
import Register from './components/User/UserRegister';
import Login from './components/User/UserLogin';
import Cart from './components/Chocolates/Cart';
import Signups from './components/Calendar/SignUps';
import UserPage from './components/User/UserPage';
import UserBookNew from './components/User/UserBookNew';
import UserAccount from './components/User/UserAccount';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyLogin from './pages/auth/VerifyLogin';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminBookings from './components/Admin/AdminBooking';
import AdminChocolates from './components/Admin/AdminChocolates';
import SignUpSelection from './components/Calendar/SignUpSelection';
import AdminSignups from './components/Admin/AdminSignups';
import AdminUsers from './components/Admin/AdminUsers';
import AboutWebsite from "./components/AboutWebsite/AboutWebsite";

// Protected routes for guarding user and admin routes
import { UserProtectedRoute, AdminProtectedRoute } from './routes/ProtectedRoutes';

// SweetAlert2 for alerts
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

// Reusable SweetAlert2 function to display alerts
const showAlert = (title, text, icon) => {
  Swal.fire({
    title: title || 'Notification',
    text: text || '',
    icon: icon || 'info',
    confirmButtonText: 'OK',
  });
};

// Main App component wrapping all routes and contexts
function App() {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            {/* Navbar remains consistent across all pages */}
            <Navbar />
            <div className="content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home showAlert={showAlert} />} /> {/* Passes the reusable showAlert function as a prop to the page for triggering alerts  */}
                <Route path="/about" element={<About />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/chocolates" element={<Chocolates showAlert={showAlert} />} />
                <Route path="/contact" element={<Contact showAlert={showAlert} />} />
                <Route path="/cart" element={<Cart showAlert={showAlert} />} />
                <Route path="/register" element={<Register showAlert={showAlert} />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-login" element={<VerifyLogin />} />
                <Route path="/login" element={<Login showAlert={showAlert} />} />
                <Route path="/signup" element={<Signups />} />
                <Route path="/signup-selection" element={<SignUpSelection />} />
                <Route path="/aboutwebsite" element={<AboutWebsite />} />

                {/* User Protected Routes */}
                <Route
                  path="/user/:userId/*"
                  element={
                    <UserProtectedRoute>
                      <UserPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/user/:userId/book"
                  element={
                    <UserProtectedRoute>
                      <UserBookNew />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/user/:userId/account"
                  element={
                    <UserProtectedRoute>
                      <UserAccount />
                    </UserProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route path="/admin" element={<AdminLogin showAlert={showAlert} />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard showAlert={showAlert} />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <AdminProtectedRoute>
                      <AdminBookings showAlert={showAlert} />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/chocolates"
                  element={
                    <AdminProtectedRoute>
                      <AdminChocolates showAlert={showAlert} />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/signups"
                  element={
                    <AdminProtectedRoute>
                      <AdminSignups showAlert={showAlert} />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminProtectedRoute>
                      <AdminUsers showAlert={showAlert} />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            </div>
            {/* Footer remains consistent across all pages */}
            <Footer />
          </div>
        </Router>
      </AdminAuthProvider>
    </UserAuthProvider>
  );
}
export default App;

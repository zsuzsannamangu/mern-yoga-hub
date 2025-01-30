const dotenv = require('dotenv');
dotenv.config(); //to load environment variables
const helmet = require('helmet'); //to secure your Express app headers
const express = require('express');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Import Socket.IO
const mongoose = require('mongoose');
const cors = require('cors');
const bookingsRoutes = require('./routes/bookings'); // Import routes
const eventRoutes = require('./routes/events'); // Import the routes
const adminRoutes = require('./routes/admin');
const chocolatesRoutes = require('./routes/chocolates');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/user');
const signupRoutes = require("./routes/signup");
const publicBookingsRoutes = require('./routes/publicBookings');
const orderRoutes = require("./routes/orders");

const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app); // Wrap the Express app with HTTP server
// Apply Helmet middleware
app.use(helmet());
// Apply cookie-parser middleware to parse cookies from requests
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:3000', // Allow frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies/credentials
};
app.use(cors(corsOptions));

app.get('/config/paypal', (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
  });

// Add headers manually for extra safety
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow frontend origin
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE'); // Allowed methods
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    ); // Allowed headers
    next();
});

const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity; restrict in production
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(express.json()); // Parse incoming JSON requests

const PORT = process.env.PORT || 5001;

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));

// Register routes and pass `io` to specific routes
app.use('/api/bookings', bookingsRoutes(io));
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/events', eventRoutes); // Public event routes
app.use('/api/chocolates', chocolatesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/user', userRoutes);
app.use("/api", signupRoutes);
app.use('/api/publicBookings', publicBookingsRoutes);
app.use("/api", orderRoutes);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown handlers
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Process terminated with SIGINT');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated with SIGTERM');
        process.exit(0);
    });
});




const mongoose = require('mongoose');
require('dotenv').config(); // loads .env

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB successfully!");
  process.exit();
})
.catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

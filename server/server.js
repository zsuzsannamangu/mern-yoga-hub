const express = require('express'); //Web framework for Node.js
const mongoose = require('mongoose'); //MongoDB object modeling tool for Node.js
const cors = require('cors'); //Middleware to handle cross-origin requests
const dotenv = require('dotenv'); //Loads environment variables from a .env file

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send("Welcome to the MERN app backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

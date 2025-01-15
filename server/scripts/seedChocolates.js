//seeding database with initial chocolate products, run node scripts/seedChocolate.js in server folder once

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chocolate = require('../models/Chocolate');
dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {

    // Define initial products
    const initialProducts = [
      {
        name: '2 Dark Chocolate Bars with Oregon Sea Salt',
        price: 15,
        image: '/images/chocolates/Dark_bars.jpg',
        description: '80% dark chocolate bars made with cacao from the Dominican Republic. Tin contains 2 bars.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 10,
      },
      {
        name: '2 White Chocolate Bars with Coconut Milk',
        price: 15,
        image: '/images/chocolates/White_Chocolate.jpg',
        description: 'Creamy white chocolate with a hint of coconut flavor.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut milk powder, organic maple sugar, organic Madagascar vanilla powder',
        inventory: 5,
      },
      {
        name: '2 Dark Chocolate Bars with Toasted Cacao Nibs',
        price: 15,
        image: '/images/chocolates/Dark_Chocolate.jpg',
        description: 'Crunchy nibs paired with smooth 80% dark chocolate.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic toasted cacao nibs, organic Madagascar vanilla powder',
        inventory: 20,
      },
      {
        name: '2 Dark Chocolate Bars with Dried Fruit',
        price: 15,
        image: '/images/chocolates/Strawberry_Chocolate.jpg',
        description: '80% dark chocolate with bursts of sweet dried fruit.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic dried strawberries, organic Madagascar vanilla powder',
        inventory: 0,
      },
    ];

    try {
      // Delete existing products to avoid duplication
      await Chocolate.deleteMany();

      // Insert initial products
      await Chocolate.insertMany(initialProducts);
    } catch (error) {
      console.error('Error during seeding:', error.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

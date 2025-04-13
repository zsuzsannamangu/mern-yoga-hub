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
        name: 'Two Dark Chocolate Bars with Oregon Sea Salt',
        price: 20,
        image: '/images/chocolates/Dark_bars.jpg',
        description: '80% dark chocolate bars made with cacao from the Dominican Republic or Peru. Tin contains 2 bars.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 10,
      },
      {
        name: 'Two White Chocolate Bars with Coconut Milk',
        price: 20,
        image: '/images/chocolates/White_Chocolate.jpg',
        description: 'Creamy white chocolate with a hint of coconut flavor.',
        details: 'Ingredients: organic cacao butter, organic coconut milk powder (coconut milk and tapioca maltodextrin), monkfruit sweetener (monkfruit and erythritol), Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Two Dark Chocolate Bars with Toasted Cacao Nibs',
        price: 20,
        image: '/images/chocolates/Dark_Chocolate.jpg',
        description: 'Crunchy cacao nibs with 80% dark chocolate.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic toasted cacao nibs, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 20,
      },
      {
        name: 'Two Dark Chocolate Bars with Nuts and Dried Fruit',
        price: 20,
        image: '/images/chocolates/Strawberry_Chocolate.jpg',
        description: '80% dark chocolate topped with pistachios + raisins (2 pieces) and almonds + cranberries (2 pieces)',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic pistachios, organic almonds, organic raisins, organic cranberries, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Big Dark Chocolate Assortment (35 pieces)',
        price: 102,
        image: '/images/chocolates/Big chocolate tin 2_edited.jpg',
        description: '80% dark chocolate with a soft filling',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Truffle Assortment (18 pieces)',
        price: 98,
        image: '/images/chocolates/Truffles_5.jpg',
        description: '80% dark chocolate with a soft filling',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Matcha white chocolate with rose',
        price: 20,
        image: '/images/chocolates/Matcha1.jpg',
        description: 'White chocolate with matcha and rose',
        details: 'Ingredients: organic cacao butter, organic coconut milk powder (coconut milk and tapioca maltodextrin), monkfruit sweetener (monkfruit and erythritol), organic matcha, rose petals, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Heart shaped chocolates',
        price: 20,
        image: '/images/chocolates/Hearts.jpg',
        description: '6 hearts',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 5,
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

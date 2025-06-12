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
        description: '80% dark chocolate bars made with cacao from The Dominican Republic, Peru or Ecuador. Tin contains 2 bars.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 10,
      },
      {
        name: 'Two White Chocolate Bars with Coconut Milk',
        price: 22,
        image: '/images/chocolates/White_Chocolate.jpg',
        description: 'Creamy white chocolate with a hint of coconut flavor.',
        details: 'Ingredients: organic cacao butter, organic coconut milk powder (coconut milk and tapioca maltodextrin), Lakanto monkfruit sweetener (monkfruit and erythritol), Oregon sea salt',
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
        image: '/images/chocolates/nutfruitbar_2.jpg',
        description: '80% dark chocolate topped with pistachios + raisins (2 pieces) and almonds + cranberries (2 pieces)',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic maple sugar, organic pistachios, organic almonds, organic raisins, organic cranberries, organic Madagascar vanilla powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Big Dark Chocolate Assortment (35 pieces)',
        price: 96,
        image: '/images/chocolates/Big chocolate tin 2_edited.jpg',
        description: '80% dark chocolate with a soft, coconut oil based filling. 5 flavors (7 of each): Lemon, Oregon peppermint, Rosemary ginger, Cardamom rose, Oregon sea salt',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, cardamom oil, rose petals, Oregon peppermint oil, organic Oregon dried peppermint, rosemary oil, Oregon dried rosemary, ginger oil, lemon oil, organic lemon peel powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Truffle Assortment (18 pieces)',
        price: 99,
        image: '/images/chocolates/Truffles_5.jpg',
        description: 'Coconut oil based truffles covered in dark chocolate. 4 flavors: Oregon lavender, Smoked Oregon sea salt, Annatto cinnamon, Oregon raspberry',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, lavender oil, organic Oregon lavender flowers, smoked Oregon sea salt, organic annatto powder, organic Ceylon cinnamon, organic Oregon raspberry powder, Oregon sea salt',
        inventory: 5,
      },
      {
        name: 'Dark Chocolate Truffles with Oregon Sea Salt',
        price: 13,
        image: '/images/chocolates/Sea_salt_chocolate.jpg',
        description: '6 pieces of chocolate topped with Oregon sea salt',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, Oregon sea salt. Cacao source: Peru, Ecuador or The Dominican Republic. Contains: coconut oil!',
        inventory: 5,
      },
      {
        name: 'Dark Chocolate Truffle Assortment',
        price: 17,
        image: '/images/chocolates/classic.jpg',
        description: '6 pieces of chocolate, 3 flavors (2 of each flavor): Oregon Sea Salt, Cardamom Rose, Oregon Raspberry. Cacao source: Peru, Ecuador or The Dominican Republic.',
        details: 'Ingredients: fair-trade organic cacao, organic cacao butter, organic coconut oil, organic maple sugar, organic Madagascar vanilla powder, cardamom oil, rose petals, organic Oregon raspberry powder, Oregon sea salt. Contains: coconut oil!',
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

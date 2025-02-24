const express = require('express');
const router = express.Router();
const Chocolate = require('../models/Chocolate');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// GET: Fetch all chocolates (public)
router.get('/', async (req, res) => {
    try {
        const chocolates = await Chocolate.find();
        return res.status(200).json(chocolates);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch chocolates', details: error.message });
    }
});

// POST: Add a new chocolate (admin only)
router.post('/', async (req, res) => {
    const { name, price, image, description, details, inventory } = req.body;

    if (!name || !price || inventory === undefined) {
        return res.status(400).json({ error: 'Name, price, and inventory are required' });
    }

    try {
        const newChocolate = new Chocolate({ name, price, image, description, details, inventory });
        const savedChocolate = await newChocolate.save();
        res.status(201).json(savedChocolate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add chocolate', details: error.message });
    }
});

// PUT: Update chocolate details (admin only)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, image, description, details, inventory } = req.body;

    try {
        const updatedChocolate = await Chocolate.findByIdAndUpdate(
            id,
            { name, price, image, description, details, inventory },
            { new: true } // Return updated document
        );
        if (!updatedChocolate) {
            return res.status(404).json({ error: 'Chocolate not found' });
        }
        res.status(200).json(updatedChocolate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update chocolate', details: error.message });
    }
});

// DELETE: Delete chocolate (admin only)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedChocolate = await Chocolate.findByIdAndDelete(id);
        if (!deletedChocolate) {
            return res.status(404).json({ error: 'Chocolate not found' });
        }
        res.status(200).json({ message: 'Chocolate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete chocolate' });
    }
});

module.exports = router;

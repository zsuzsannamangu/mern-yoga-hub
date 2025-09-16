const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Import the Event model
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// POST: Create a new event (admin-only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { title, date, time, location, signUpLink } = req.body;

    if (!title || !date || !time) {
        return res.status(400).json({ error: 'Title, date, and time are required.' });
    }

    try {
        const newEvent = new Event({
            title,
            date,
            time,
            location,
            signUpLink: signUpLink || '', // Default to an empty string
        });

        const savedEvent = await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event', details: error.message });
    }
});

// GET: Fetch all events (any authenticated user)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1, time: 1 }); // Fetch all events from MongoDB
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }
});

// DELETE: Delete an event (admin-only)
/*router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event', details: error.message });
    }
});*/

// DELETE: Bulk delete events (admin-only)
router.delete('/bulk', authMiddleware, adminMiddleware, async (req, res) => {
    const { eventIds } = req.body; // Extract event IDs from the request body

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
        return res.status(400).json({ error: 'Invalid event IDs provided' });
    }

    try {
        const result = await Event.deleteMany({ _id: { $in: eventIds } }); // Delete events with matching IDs
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No events found to delete' });
        }
        res.status(200).json({ message: `${result.deletedCount} events deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete events', details: error.message });
    }
});


// PUT: Update an event (admin-only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, date, time, location, signUpLink, isExternal } = req.body; // Add isExternal

    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, date, time, location, signUpLink, isExternal }, // Update with isExternal
            { new: true } // Return the updated document
        );
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event', details: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// GET: Fetch all finance entries (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const finances = await Finance.find({})
            .sort({ date: 1, time: 1 }); // Sort by date and time ascending

        return res.status(200).json({
            success: true,
            message: 'Fetched all finance entries',
            finances
        });
    } catch (error) {
        console.error('Error fetching finance entries:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching finance entries'
        });
    }
});

// POST: Create new finance entry (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            date,
            time,
            class: className,
            location,
            category,
            rate,
            grossRate,
            receivedRate,
            paymentFrequency,
            paymentMethod,
            paymentRequestSent,
            paid,
            taxed
        } = req.body;

        // Validate required fields
        if (!date || !time || !className || !location || grossRate === undefined || receivedRate === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: date, time, class, location, grossRate, and receivedRate are required'
            });
        }

        // Validate rates are numbers
        const grossRateNum = parseFloat(grossRate);
        const receivedRateNum = parseFloat(receivedRate);
        const rateNum = rate !== undefined ? parseFloat(rate) : receivedRateNum; // For backward compatibility
        
        if (isNaN(grossRateNum) || grossRateNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Gross rate must be a valid positive number'
            });
        }
        
        if (isNaN(receivedRateNum) || receivedRateNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Received must be a valid positive number'
            });
        }

        const newFinanceEntry = new Finance({
            date,
            time,
            class: className,
            location,
            category: category || 'other',
            rate: rateNum, // Keep for backward compatibility
            grossRate: grossRateNum,
            receivedRate: receivedRateNum,
            paymentFrequency: paymentFrequency || 'per-class',
            paymentMethod: paymentMethod || 'cash',
            paymentRequestSent: paymentRequestSent || 'no',
            paid: paid || 'no',
            taxed: taxed || 'no'
        });

        const savedEntry = await newFinanceEntry.save();

        return res.status(201).json({
            success: true,
            message: 'Finance entry created successfully',
            finance: savedEntry
        });
    } catch (error) {
        console.error('Error creating finance entry:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating finance entry'
        });
    }
});

// PUT: Update finance entry (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            date,
            time,
            class: className,
            location,
            category,
            rate,
            grossRate,
            receivedRate,
            paymentFrequency,
            paymentMethod,
            paymentRequestSent,
            paid,
            taxed
        } = req.body;

        // Validate required fields
        if (!date || !time || !className || !location || grossRate === undefined || receivedRate === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: date, time, class, location, grossRate, and receivedRate are required'
            });
        }

        // Validate rates are numbers
        const grossRateNum = parseFloat(grossRate);
        const receivedRateNum = parseFloat(receivedRate);
        const rateNum = rate !== undefined ? parseFloat(rate) : receivedRateNum; // For backward compatibility
        
        if (isNaN(grossRateNum) || grossRateNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Gross rate must be a valid positive number'
            });
        }
        
        if (isNaN(receivedRateNum) || receivedRateNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Received must be a valid positive number'
            });
        }

        const updatedEntry = await Finance.findByIdAndUpdate(
            id,
            {
                date,
                time,
                class: className,
                location,
                category: category || 'other',
                rate: rateNum, // Keep for backward compatibility
                grossRate: grossRateNum,
                receivedRate: receivedRateNum,
                paymentFrequency,
                paymentMethod,
                paymentRequestSent,
                paid,
                taxed
            },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                message: 'Finance entry not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Finance entry updated successfully',
            finance: updatedEntry
        });
    } catch (error) {
        console.error('Error updating finance entry:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while updating finance entry'
        });
    }
});

// DELETE: Delete finance entry (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEntry = await Finance.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({
                success: false,
                message: 'Finance entry not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Finance entry deleted successfully',
            finance: deletedEntry
        });
    } catch (error) {
        console.error('Error deleting finance entry:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting finance entry'
        });
    }
});

module.exports = router;

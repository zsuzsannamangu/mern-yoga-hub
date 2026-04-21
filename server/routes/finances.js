const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');
const FinanceTravelSettings = require('../models/FinanceTravelSettings');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const TRAVEL_SINGLETON_ID = 'singleton';
const DEFAULT_TRAVEL_MPG = 37.5;
const DEFAULT_TRAVEL_GAS = 3.65;

function sanitizeLocationMilesForSave(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    for (const [k, v] of Object.entries(raw)) {
        if (typeof k !== 'string' || !k.trim()) continue;
        const n = parseFloat(v);
        if (!Number.isNaN(n) && n >= 0) out[k] = n;
    }
    return out;
}

// GET /api/finances/travel-settings — must be before /:id routes
router.get('/travel-settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const doc = await FinanceTravelSettings.findById(TRAVEL_SINGLETON_ID).lean();
        if (!doc) {
            return res.status(200).json({
                success: true,
                settings: {
                    locationMiles: {},
                    mpg: DEFAULT_TRAVEL_MPG,
                    gasPricePerGallon: DEFAULT_TRAVEL_GAS,
                },
            });
        }
        const lm = doc.locationMiles && typeof doc.locationMiles === 'object' && !Array.isArray(doc.locationMiles)
            ? sanitizeLocationMilesForSave(doc.locationMiles)
            : {};
        return res.status(200).json({
            success: true,
            settings: {
                locationMiles: lm,
                mpg: typeof doc.mpg === 'number' && doc.mpg > 0 ? doc.mpg : DEFAULT_TRAVEL_MPG,
                gasPricePerGallon:
                    typeof doc.gasPricePerGallon === 'number' && doc.gasPricePerGallon >= 0
                        ? doc.gasPricePerGallon
                        : DEFAULT_TRAVEL_GAS,
            },
        });
    } catch (error) {
        console.error('Error fetching finance travel settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching travel settings',
        });
    }
});

// PUT /api/finances/travel-settings — full replace of locationMiles + mpg + gas
router.put('/travel-settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { locationMiles, mpg, gasPricePerGallon } = req.body;
        if (locationMiles === undefined || typeof locationMiles !== 'object' || Array.isArray(locationMiles)) {
            return res.status(400).json({
                success: false,
                message: 'locationMiles must be an object',
            });
        }
        const m = parseFloat(mpg);
        const g = parseFloat(gasPricePerGallon);
        if (Number.isNaN(m) || m <= 0) {
            return res.status(400).json({ success: false, message: 'mpg must be a positive number' });
        }
        if (Number.isNaN(g) || g < 0) {
            return res.status(400).json({ success: false, message: 'gasPricePerGallon must be a non-negative number' });
        }
        const cleanMiles = sanitizeLocationMilesForSave(locationMiles);
        const doc = await FinanceTravelSettings.findByIdAndUpdate(
            TRAVEL_SINGLETON_ID,
            {
                _id: TRAVEL_SINGLETON_ID,
                locationMiles: cleanMiles,
                mpg: m,
                gasPricePerGallon: g,
            },
            { upsert: true, new: true, runValidators: true }
        );
        const lm =
            doc.locationMiles && typeof doc.locationMiles === 'object' && !Array.isArray(doc.locationMiles)
                ? sanitizeLocationMilesForSave(doc.locationMiles)
                : {};
        return res.status(200).json({
            success: true,
            message: 'Travel settings saved',
            settings: {
                locationMiles: lm,
                mpg: doc.mpg,
                gasPricePerGallon: doc.gasPricePerGallon,
            },
        });
    } catch (error) {
        console.error('Error saving finance travel settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while saving travel settings',
        });
    }
});

function parseOptionalTripFields(body) {
    const { tripMiles, tripGasCost } = body;
    let tripMilesVal = null;
    if (tripMiles !== undefined && tripMiles !== null && tripMiles !== '') {
        const t = parseFloat(tripMiles);
        if (isNaN(t) || t < 0) {
            return { error: 'tripMiles must be a non-negative number or empty' };
        }
        tripMilesVal = t;
    }
    let tripGasCostVal = null;
    if (tripGasCost !== undefined && tripGasCost !== null && tripGasCost !== '') {
        const g = parseFloat(tripGasCost);
        if (isNaN(g) || g < 0) {
            return { error: 'tripGasCost must be a non-negative number or empty' };
        }
        tripGasCostVal = g;
    }
    return { tripMiles: tripMilesVal, tripGasCost: tripGasCostVal };
}

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
            taxed,
            teachingRole,
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

        const tripParsed = parseOptionalTripFields(req.body);
        if (tripParsed.error) {
            return res.status(400).json({ success: false, message: tripParsed.error });
        }

        const role =
            teachingRole === 'sub' || teachingRole === 'regular' ? teachingRole : 'regular';

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
            taxed: taxed || 'no',
            teachingRole: role,
            tripMiles: tripParsed.tripMiles,
            tripGasCost: tripParsed.tripGasCost
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
            taxed,
            teachingRole,
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

        const tripParsedPut = parseOptionalTripFields(req.body);
        if (tripParsedPut.error) {
            return res.status(400).json({ success: false, message: tripParsedPut.error });
        }

        const rolePut =
            teachingRole === 'sub' || teachingRole === 'regular' ? teachingRole : 'regular';

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
                taxed,
                teachingRole: rolePut,
                tripMiles: tripParsedPut.tripMiles,
                tripGasCost: tripParsedPut.tripGasCost
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

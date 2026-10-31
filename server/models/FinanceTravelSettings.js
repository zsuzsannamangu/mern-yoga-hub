const mongoose = require('mongoose');

const SINGLETON_ID = 'singleton';

/**
 * Single document: one-way miles per canonical finance location + vehicle assumptions for gas estimates.
 */
const financeTravelSettingsSchema = new mongoose.Schema(
    {
        _id: { type: String, default: SINGLETON_ID },
        locationMiles: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        /** Hyundai Tucson Hybrid real-world teaching-drive mpg (~400 mi / ~$67 fill). */
        mpg: { type: Number, default: 28 },
        gasPricePerGallon: { type: Number, default: 4.70 },
    },
    { collection: 'financetravelsettings' }
);

module.exports = mongoose.model('FinanceTravelSettings', financeTravelSettingsSchema);

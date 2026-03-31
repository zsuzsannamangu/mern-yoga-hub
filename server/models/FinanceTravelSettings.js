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
        /** Hyundai Tucson Hybrid EPA combined (FWD 38 / AWD 37); default is midpoint. */
        mpg: { type: Number, default: 37.5 },
        gasPricePerGallon: { type: Number, default: 3.65 },
    },
    { collection: 'financetravelsettings' }
);

module.exports = mongoose.model('FinanceTravelSettings', financeTravelSettingsSchema);

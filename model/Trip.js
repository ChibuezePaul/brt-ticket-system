const mongoose = require("mongoose");

const tripSchema = mongoose.Schema({
        busDetails: {
            type: Object,
            required: true
        },
        reservationRef: {
            type: String,
            unique: true
        },
        createdOn: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: String,
            default: 'Y'
        }
    },
    { strictQuery: 'throw' });

module.exports = mongoose.model("Trip", tripSchema);
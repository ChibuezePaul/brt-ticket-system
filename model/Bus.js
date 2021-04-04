const mongoose = require("mongoose");

const busSchema = mongoose.Schema({
    plateNo: {
        type: String,
        required: true,
        unique: true
    },
    busFare: {
        type: Number,
        required: true
    },
    numberOfSeat: {
        type: Number,
        required: true
    },
    availableSeats: Array,
    createdOn: {
        type: Date,
        default: Date.now
    },
    departureRoutes: Array,
    destinationRoutes: Array,
    isActive: {
        type: String,
        default: 'Y'
    }
    },
    { strictQuery: 'throw' });

module.exports = mongoose.model("Bus", busSchema);
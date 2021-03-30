const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
    },
    {
        strictQuery: 'throw'
    });

module.exports = mongoose.model("User", userSchema);
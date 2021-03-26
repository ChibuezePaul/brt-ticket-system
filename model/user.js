const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /\d{1,}/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        createdOn: {
            type: Date,
            default: Date.now
        },
        delFlag: {
            type: String,
            default: "N",
            index: true
        },
        emailVerificationCode: Number
    },
    {
        strictQuery: 'throw'
    });

module.exports = mongoose.model("User", userSchema);
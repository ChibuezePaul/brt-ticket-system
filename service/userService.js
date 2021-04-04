const bcrypt = require('bcryptjs');
const User = require('../model/User');
const {logger} = require('../core/logger');

exports.registerUser = async (userDetails, role) => {
    const {name, email, password, confirmPassword} = userDetails;

    if (!name || !email || !password || !confirmPassword) {
        throw Error('All Fields Are Required');
    }

    if (password !== confirmPassword) {
        throw Error('Password Fields Does Not Match');
    }

    return bcrypt.hash(password, 10)
        .then(passwordHash => {
            return User({
                name: name,
                email: email,
                password: passwordHash,
                role: role || 'user'
            }).save()
                .then(user => user)
                .catch(error => {
                    if (error) {
                        logger.error(`Error occurred saving new user with email ${email}: ${error}`);
                        throw Error('Error Occurred Creating User. Contact Admin!');
                    }
                });
        })
        .catch(error => {
            if (error) {
                logger.error(`Error occurred hashing password for new user with email: ${email} ${error}`);
                throw Error('Error Occurred Creating User. Contact Admin!');
            }
        });
};
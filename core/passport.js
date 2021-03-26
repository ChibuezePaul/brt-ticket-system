const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const { logger } = require('../core/logger');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
            User.findOne({ email })
                .then(user => {
                    if(!user){
                        return done(null, false, { message: 'Email not registered'})
                    }
                    bcrypt.compare(password, user.password, (error, isMatch) => {
                        if(error){
                            throw new Error(error.message);
                        }
                        if(isMatch){
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'incorrect Password' });
                        }
                    });
                })
                .catch(error => logger.error(error.message))
        })
    );
}
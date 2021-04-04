const mongoose = require("mongoose");
const { DB_URL } = require("./config.js");
const { logger } = require("./logger.js");
const User = require('../model/User');
const userService = require('../service/userService');

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, autoIndex: true })
    .then(() => {
        User.exists({name: 'su', role: 'admin'})
            .then(hasSuperUser => {
                if(!hasSuperUser){
                    const user = {
                        email: 'su@brtsystem.com',
                        name: 'su',
                        password: 'su',
                        confirmPassword: 'su'
                    };
                    userService.registerUser(user, 'admin')
                        .then(user => logger.info(`su created successfully ${user.name}`))
                        .catch(error => logger.error(`Error creating su: ${error.message}`));
                }
            });
        logger.info("Database connected successfully");
    })
    .catch(() => logger.error("Database connection error"));

mongoose.connection.on('error', error => logger.error(`Database connection error: ${error.message}`));
module.exports = {
    ensureAuthenticate: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Kindly Login or Register');
        res.render('login', {error_msg: 'Kindly Login or Register'});
    },

    permit(users) {
        return (req, res, next) => {
            const isAuthorized = users.includes(req.user.role);

            if (!isAuthorized) {
                return res.status(403).send({
                    error: {
                        message: 'Unauthorized Access. Contact the admin.',
                    },
                });
            }

            next();
        };
    }
};

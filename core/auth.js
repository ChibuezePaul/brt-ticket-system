module.exports = {
    ensureAuthenticate: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Kindly Login or Register');
        res.redirect('/users/login');
    }
};

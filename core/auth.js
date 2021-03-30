module.exports = {
    ensureAuthenticate: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Kindly Login or Register');
        res.render('login', {error_msg: 'Kindly Login or Register'});
    }
};

const passport = require('passport');
const userRouter = require('../utils/baseRoute');

/* GET users listing. */
userRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

userRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

userRouter.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'Logged Out Successfully');
  res.redirect('/login')
});

userRouter.post('/signup', (req, res) => {

})

module.exports = userRouter;

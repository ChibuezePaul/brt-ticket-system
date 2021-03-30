// const passport = require('passport');
// const userRouter = require('../utils/baseRoute');
// const userService = require("../service/userService");
//
// userRouter.post('/login', (req, res, next) => {
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
//   })(req, res, next);
// });
//
// userRouter.get('/logout', (req, res, next) => {
//   req.logout();
//   req.flash('success_msg', 'Logged Out Successfully');
//   res.redirect('/login')
// });
//
// userRouter.post('/register', (req, res) => {
//   userService.registerUser(req.body)
//       .then(user => res.render('index', {user}))
//       .catch(error => res.render('login', {error_msg: error.message}));
// });
//
// module.exports = userRouter;

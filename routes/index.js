const homeRouter = require('../utils/baseRoute');
const { ensureAuthenticate } = require('../core/auth');

/* GET home page. */
homeRouter.get('/', (req, res) => {
  res.render('index', { title: 'BRT Ticket System' });
});

homeRouter.get('/dashboard', ensureAuthenticate, (req, res) => {
  res.render('dashboard', { title: 'Welcome To BRT Ticket System' });
});

homeRouter.get('/login', (req, res) => {
    res.render('login');
})

homeRouter.get('/signup', (req, res) => {
    res.render('signup');
})

module.exports = homeRouter;

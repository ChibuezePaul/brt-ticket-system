const passport = require('passport');
const express = require('express');
const baseRouter = express.Router();
const userService = require("../service/userService");
const adminService = require("../service/adminService");
const {ensureAuthenticate, permit} = require('../core/auth');
let ticket = {};

//### Booking Routes ###

baseRouter.get('/home', ensureAuthenticate, (req, res) => {
        res.render('index');
});

baseRouter.get('/', (req, res) => {
    res.render('landingPage', {layout: false,});
    // res.render('index');
});

baseRouter.post('/buses', ensureAuthenticate, (req, res) => {
    ticket = {};
    const route = req.body;
    ticket['route'] = route;
    console.log(route);
    adminService.getAvailableBusForRoute(route)
        .then(availableBus => res.render('availableBus', {route, availableBus}))
        .catch(error => res.render('index', {error_msg: error.message}));
});

baseRouter.post('/reservation', ensureAuthenticate, (req, res) => {
    const bookedSeat = req.body;
    ticket['seat'] = bookedSeat;
    console.log("redirected payment", ticket);
    const busFare = adminService.reserveSeat(bookedSeat);
    ticket['busFare'] = busFare;
    return res.render('payment', {busFare})
});

baseRouter.post('/payment', ensureAuthenticate, (req, res) => {

    console.log(ticket['route'] + " <== Route Seat ==> " + ticket['seat']);
    adminService.bookSeat(ticket['seat'], ticket['route'])
        .then(trip => res.render('receipt', {trip}))
        .catch(error => res.render('index', {error_msg: error.message}));
});

baseRouter.post('/cancelReservation', ensureAuthenticate, (req, res)=>{
    const tranRef = req.body.tranRef;
    // Cancel Reservation here
    adminService.cancelReservation(tranRef)
    .then(() => res.render('index', {success_msg: 'Booking Cancelled Successfuly!'}))
    .catch(error => res.status(200).render('index', {error_msg: error, buses: ticket['buses']}));
})

baseRouter.get('/dashboard',  (req, res) => {
    // baseRouter.get('/dashboard', ensureAuthenticate, (req, res) => {
        res.render('dashboard', { title: 'Welcome To BRT Ticket System' });
});

//### User Routes ###

baseRouter.get('/login', (req, res) => {
    res.render('login');
});

baseRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

baseRouter.get('/logout', ensureAuthenticate, (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged Out Successfully');
    res.redirect('/login')
});

baseRouter.post('/register', (req, res) => {
    userService.registerUser(req.body)
        .then(user => res.render('index', {success_msg: `Welcome ${user.name}`}))
        .catch(error => res.render('login', {error_msg: error.message}));
});

//### Admin Routes ###

baseRouter.get('/admin', ensureAuthenticate, permit(['admin']), (req, res) => {
    console.log(req.user);
    adminService.getAllBus()
        .then(buses => {
            ticket['buses'] = buses;
            res.render('admin/index', {layout: false, buses})
        })
        .catch(() => res.render('admin/index', {layout: false, buses: []}));
});

baseRouter.get('/admin/profile', ensureAuthenticate, permit(['admin']), (req, res) => {
    res.render('admin/profile', {layout: false});
});

baseRouter.get('/admin/login', (req, res) => {
    res.render('admin/login', {layout: false});
});

baseRouter.post('/admin/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
});

baseRouter.get('/admin/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged Out Successfully');
    res.redirect('/admin/login')
});

baseRouter.get('/admin/register', (req, res) => {
    res.render('admin/register', {layout: false});
});

baseRouter.post('/admin/register', (req, res) => {
    userService.registerUser(req.body, 'admin')
        .then(user => res.render('admin/index', {layout:false, success_msg: `Welcome ${user.name}`}))
        .catch(error => res.render('admin/login', {layout: false, error_msg: error.message}));
});

baseRouter.post('/admin/register-bus', ensureAuthenticate, permit(['admin']), (req, res) => {
    console.log('req.body', req.body);
    adminService.createBus(req.body)
        .then(() => {
            // res.redirect('/admin')
            adminService.getAllBus()
            .then(buses => {
                ticket['buses'] = buses;
                res.render('admin/index', {layout: false, success_msg: `BRT-${req.body.plateNo} was successfully Added`, buses})
            })
            .catch(() => res.render('admin/index', {layout: false, buses: []}));
        
        })
        .catch(error => res.render('admin/index', {layout: false, error_msg: error, buses: ticket['buses']}));
});

baseRouter.post('/admin/update-bus', ensureAuthenticate, permit(['admin']), (req, res) => {
    console.log('req.body', req.body);
    adminService.updateBus(req.body)
        .then(() => {
            adminService.getAllBus()
            .then(buses => {
                ticket['buses'] = buses;
                // res.render('admin/index', {layout: false, buses})
                res.render('admin/index', {layout: false, success_msg: `BRT-${req.body.plateNo} was updated successfully`, buses})
            })
            .catch(() => res.render('admin/index', {layout: false, buses: []}));
        
        })
        .catch(error => res.render('admin/index', {layout: false, error_msg: error, buses: ticket['buses']}));
});

baseRouter.get('/admin/bus-action', ensureAuthenticate, permit(['admin']), (req, res) => {
    console.log('req.body', req.body);
    adminService.busAction(req.query)
    .then(() => {
        const {action, id} = req.query;
       
        adminService.getAllBus()
        .then(buses => {
            ticket['buses'] = buses;
            res.render('admin/index', {layout: false, success_msg: `BRT-${id} ${action} was  successful`, buses})
        })
        .catch(() => res.render('admin/index', {layout: false, buses: []}));
        
        })
        .catch(error => res.status(200).render('admin/index', {
            layout: false,
            error_msg: error,
            buses: ticket['buses']
        }));
});

module.exports = baseRouter;
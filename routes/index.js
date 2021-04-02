const passport = require('passport');
const express = require('express');
const baseRouter = express.Router();
const userService = require("../service/userService");
const adminService = require("../service/adminService");
const { ensureAuthenticate } = require('../core/auth');
let ticket = {};

//### Booking Routes ###

baseRouter.get('/', (req, res) => {
    res.render('index');
});

baseRouter.post('/buses', (req, res) => {
    ticket = {};
    const route = req.body;
    ticket['route'] = route;
    console.log(route);
    adminService.getAvailableBusForRoute(route)
        .then(availableBus => res.render('availableBus', {route, availableBus}))
        .catch(error => res.render('index', {error_msg: error.message}));
});

baseRouter.post('/reservation', (req, res) => {
    const bookedSeat = req.body;
    ticket['seat'] = bookedSeat;
    console.log("redirected payment",ticket);
    const busFare = adminService.reserveSeat(bookedSeat);
    ticket['busFare'] = busFare;
    return res.render('payment', {busFare})
});

baseRouter.get('/payment', (req, res) => {
    adminService.bookSeat(ticket['seat'], ticket['route'])
        .then(trip => res.render('receipt', {trip}))
        .catch(error => res.render('index', {error_msg: error.message}));
});

baseRouter.get('/cancelReservation', (req, res)=>{
    // Cancel Reservation here
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
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

baseRouter.get('/logout', (req, res) => {
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

baseRouter.get('/admin', (req, res) => {
    adminService.getAllBus()
        .then(buses => {
            ticket['buses'] = buses;
            res.render('admin/index', {layout: false, buses})
        })
        .catch(error => res.render('admin/index', {layout: false, buses: []}));
});

baseRouter.get('/admin/profile', (req, res) => {
    res.render('admin/profile');
});

baseRouter.get('/admin/register', (req, res) => {
    res.render('admin/register');
});

baseRouter.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

baseRouter.get('/admin/register', (req, res) => {
    res.render('admin/register');
});

baseRouter.post('/admin/register-bus', (req, res) => {
    console.log('req.body',req.body);
    adminService.createBus(req.body)
        .then(() => res.redirect('/admin'))
        .catch(error => res.render('admin/index', {layout: false, error_msg: error, buses: ticket['buses']}));
});

baseRouter.get('/admin/bus-action', (req, res) => {
    console.log('req.body',req.body);
    adminService.busAction(req.query)
        .then(() => res.redirect('/admin'))
        .catch(error => res.status(200).render('admin/index', {layout: false, error_msg: error, buses: ticket['buses']}));
});

module.exports = baseRouter;
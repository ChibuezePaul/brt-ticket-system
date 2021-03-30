const Bus = require('../model/Bus');
const {logger} = require('../core/logger');

exports.createBus = (newBusDetails) => {
    const {plateNo, numberOfSeat, departureRoutes, destinationRoutes} = newBusDetails;
    if (!plateNo || !numberOfSeat) {
        throw Error('Invalid Bus Details');
    }

    if (!departureRoutes || !departureRoutes) {
        throw Error('Bus Routes Are Required');
    }
    let availableSeats = [];
    for (let i = 1; i <= numberOfSeat; i++) {
        availableSeats.push({seatNo: i, isAvailable: true, plateNo})
    }

    return Bus({
        plateNo,
        numberOfSeat,
        availableSeats,
        departureRoutes,
        destinationRoutes
    }).save(error => {
        if (error) {
            logger.error(`Error occurred creating bus: ${error}`);
            throw Error('Error occurred creating bus');
        }
    });
};

exports.getAvailableBusForRoute = (route) => {
    const {departure, destination} = route;
    if (!departure || !destination) {
        throw Error('Route Details Are Required');
    }
    return Bus.find({isActive: 'Y', departureRoutes: {$in: [departure]}, destinationRoutes: {$in: [destination]}})
        .$where('this.availableSeats.length > 0')
        .collation({locale: 'en', strength: 1})
        .limit(1)
        .orFail(() => {
            logger.error(`Error fetching available buses`);
            throw Error('No Available Bus');
        })
        .then(buses => buses);
};

exports.bookSeat = (seatDetails) => {
    const plateNo = Object.keys(seatDetails);
    let seatNo = seatDetails[plateNo];
    console.log('plateNo', plateNo)
    console.log('seatNo', seatNo)
    if (typeof seatNo === "string") {
        seatNo = [seatNo]
    }
    return Bus.findOne({isActive: 'Y', plateNo: plateNo})
        .orFail((error) => {
            logger.error(`Error fetching bus with plate number ${plateNo}: ${error}`);
            throw Error('Bus Not Found');
        })
        .then(bus => {
            const availableSeatCount = bus.availableSeats.length;
            seatNo.forEach(s => bus.availableSeats = bus.availableSeats.filter(seat => seat.seatNo != s));
            const remainingSeatCount = bus.availableSeats.length;
            if (remainingSeatCount === availableSeatCount) {
                throw Error(`Seat Already Booked`)
            }
            bus.save()
                .catch(error => {
                    if (error) {
                        logger.error(`Error saving booked seat with details ${seatDetails}: ${error}`);
                    }
                })
        })
};

exports.setBusInactive = (plateNo) => {
    return Bus.findOneAndUpdate(
        {isActive: 'Y', plateNo: plateNo},
        {
            $set: {
                isActive: 'N'
            }
        },
        {
            new: true,
            useFindAndModify: false
        })
        .orFail((error) => {
            logger.error(`Error fetching bus with plate number ${plateNo}: ${error}`);
            throw Error('Bus Not Found');
        })
        .then(bus => bus);
};
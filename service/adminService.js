const Bus = require('../model/Bus');
const Trip = require('../model/Trip');
const {logger} = require('../core/logger');

exports.createBus = (newBusDetails) => {
    return new Promise((resolve, reject) => {
        let {plateNo, busFare, numberOfSeat, departureRoutes, destinationRoutes} = newBusDetails;

        if (!plateNo || !numberOfSeat) {
            throw Error('Invalid Bus Details');
        }

        if (!departureRoutes || !destinationRoutes) {
            throw Error('Bus Routes Are Required');
        }

        departureRoutes = departureRoutes.split(',');
        destinationRoutes = destinationRoutes.split(',');

        let availableSeats = [];
        for (let i = 1; i <= numberOfSeat; i++) {
            availableSeats.push({seatNo: i, isAvailable: true, plateNo, busFare})
        }

        new Bus({
            plateNo,
            busFare,
            numberOfSeat,
            availableSeats,
            departureRoutes,
            destinationRoutes
        }).save()
            .then(user => resolve(user))
            .catch(error => {
                logger.error(`Error occurred creating bus: ${error}`);
                reject('Error Occurred Creating Bus. Contact Admin!')
            });
    });
};

exports.updateBus = (newBusDetails) => {
    return new Promise((resolve, reject) => {
        let {plateNo, busFare, departureRoutes, destinationRoutes} = newBusDetails;

        if (!plateNo) {
            throw Error('Invalid Bus Details');
        }

        if (!departureRoutes || !destinationRoutes) {
            throw Error('Bus Routes Are Required');
        }

        departureRoutes = departureRoutes.split(',');
        destinationRoutes = destinationRoutes.split(',');
        var plateNumber = plateNo.slice(-3)

        getBusByPlateNo(plateNumber)
            .then(bus => {
                logger.info(`The bus picked is ${bus}`);
                bus.departureRoutes = departureRoutes;
                bus.destinationRoutes = destinationRoutes;
                bus.busFare = busFare.slice(-3);
                    return bus.save()
                        .then(bus => resolve(bus))
                        .catch(error => {
                            logger.error(`Error Updating bus seats with details ${plateNo}: ${error}`);
                            return reject('Bus Update Failed. Contact Admin!');
                        });
            })
            .catch(error => {
                logger.error(`Error Finding Bus with ${plateNo}: ${error}`);
                return reject('Unable To Find Bus');
            });
    });

}

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

exports.bookSeat = (seatDetails, routeDetails) => {
    const plateNo = Object.keys(seatDetails).toString().split(',')[0];
    return Bus.findOne({isActive: 'Y', plateNo: plateNo})
        .orFail((error) => {
            logger.error(`Error fetching bus with plate number ${plateNo}: ${error}`);
            throw Error('Bus Not Found');
        })
        .then(bus => {
            let seatNo = Object.values(seatDetails);
            bus.availableSeats.forEach(seat => {
                console.log(!seat.isAvailable);
                console.log(seat.seatNo == seatNo);
                if(seat.seatNo == seatNo && !seat.isAvailable){
                    throw Error('Seat Already Booked');
                }
            });
            bus = this.reserveSeat(seatDetails, bus);
            bus.save()
                .catch(error => {
                    if (error) {
                        logger.error(`Error saving booked seat with details ${seatDetails}: ${error}`);
                    }
                });
            const busDetails = {
                seatNo: Object.values(seatDetails).toString(),
                departure: routeDetails.departure,
                destination: routeDetails.destination,
                departureTime: routeDetails.depart,
                busPlateNo: plateNo,
                busFare: bus.tripFare,
                seatFare: Object.keys(seatDetails).toString().split(',')[1]
            };
            const reservationRef = 'BRT'+bus.plateNo+new Date().getTime();
            return Trip({
                busDetails,
                reservationRef,
            }).save()
                .then(trip => trip)
                .catch(error => {
                    if (error) {
                        logger.error(`Error saving trip with details ${bus}: ${error}`);
                    }
                });
        })
};

exports.busAction = (command) => {
    if(!command){
        throw Error('Invalid Command Sent')
    }
    const {action, id} = command;
    if(!action || !id){
        throw Error('Invalid Parameters')
    }

    switch (action) {
        case 'delete':
            return setBusInactive(id);
        case 'reset':
            return resetBus(id);
        case 'update':

    }
};

exports.getAllBus = () => {
    return Bus.find({isActive: 'Y'})
        .sort({plateNo: 'asc'})
        .then(buses => buses);
};

exports.reserveSeat = (seatDetails, bus) => {
    let keyDetails = Object.keys(seatDetails);
    keyDetails = keyDetails.toString().split(',');
    let seatNo = Object.values(seatDetails);
    let tripFare = 0;
    seatNo = seatNo.toString().split(',');
    if(bus){
        seatNo.forEach(s => {
            tripFare += Number(bus.busFare);
            bus.availableSeats = bus.availableSeats.filter(seat => seat.seatNo != s)
        });
        bus['tripFare'] = tripFare;
        return bus;
    }
    seatNo.forEach(() => tripFare += Number(keyDetails[1]));
    return tripFare;
};

resetBus = (plateNo) => {
    return new Promise((resolve, reject) => {
        getBusByPlateNo(plateNo)
            .then(bus => {
                if (bus.availableSeats.length === 0) {
                    for (let i = 1; i <= bus.numberOfSeat; i++) {
                        bus.availableSeats.push({seatNo: i, isAvailable: true, plateNo, busFare: bus.busFare})
                    }
                    return bus.save()
                        .then(bus => resolve(bus))
                        .catch(error => {
                            logger.error(`Error Resetting bus seats with details ${plateNo}: ${error}`);
                            return reject('Bus Reset Failed. Contact Admin!');
                        });
                } else {
                    return reject('Bus Still Has Available Seats');
                }
            })
            .catch(error => {
                logger.error(`Error Resetting bus seats with details ${plateNo}: ${error}`);
                return reject('Unable To Reset Bus');
            });
    });
};

setBusInactive = (plateNo) => {
    return new Promise((resolve, reject) => {
        return Bus.findOneAndUpdate(
            {isActive: 'Y', plateNo: plateNo},
            {
                $set: {
                    isActive: 'N',
                    plateNo: plateNo+'+D+'+Date.now()
                }
            },
            {
                new: true,
                useFindAndModify: false
            })
            .orFail((error) => {
                logger.error(`Error fetching bus with plate number ${plateNo}: ${error}`);
                return reject('Bus Not Found');
            })
            .then(bus => resolve(bus));
    });
};

getBusByPlateNo = (plateNo) =>{
    return Bus.findOne({isActive: 'Y', plateNo: plateNo})
        .then(bus => bus)
        .catch(() => '404');
};
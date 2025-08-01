const stripe = require('stripe')(process.env.STRIPE_SECTER_KEY);
const catchAsync = require('./../utlis/catchAsync');
const Tour = require('./../models/tourModels');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utlis/appError');
const factory = require('./factoryFunctions');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) GET CURRENTLY BOOKED TOUR
    const tour = await Tour.findById(req.params.tourId);

    // 2) CREATE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment'
    });

    // 3) CREATE SESSION AS RESPONSE
    res.status(200).json({
        status: 'success',
        session
    })
});

exports.createBookingsCheckout = catchAsync(async (req, res, next) => {
    // THIS IS ONLY TEMPORARY BECAUSE IT IS UNSECURE AND EVERYONE CAN BOOK WITHOUT PAYING
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);

exports.getMyBills = catchAsync(async (req, res, next) => {
    const bills = await Booking.find({ user: req.user.id })
        .select('-user')
        .populate({
            path: 'tour',
            select: 'name price -_id'
        });
    res.status(200).json({
        status: 'success',
        bills
    });
});

const Tour = require('./../models/tourModels');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModels');
const catchAsync = require('./../utlis/catchAsync');
const AppError = require('./../utlis/appError');

exports.getOverview = catchAsync(async (req, res, next) => {

    // 1) GET TOUR DATA FROM COLLECTION
    const tours = await Tour.find();
    // 2) BUILD A TEMPLATE
    // 3) RENDER TOUR DATA INTO THE TEMPLATE USING DATA FROM STEP 1

    const isMyToursPage = req.originalUrl.endsWith('/my-tours');

    res.status(200).render('overview', {
        title: isMyToursPage ? 'My Tours' : 'All Tours',
        tours,
        isMyToursPage
    });
});

exports.getTour = catchAsync(async (req, res, next) => {

    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};

exports.getSignupForm = (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign up'
    });
}

exports.getForgetPasswordForm = (req, res, next) => {
    res.status(200).render('forgetPassword', {
        title: 'Forget password'
    })
}

exports.getResetPasswordForm = (req, res, next) => {
    res.status(200).render('resetPassword', {
        title: 'Reset password'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
}

exports.getMyReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ user: req.user.id }).populate({
        path: 'tour',
        select: 'name imageCover'
    });

    res.status(200).render('myReviews', {
        status: 'success',
        title: 'My Reviews',
        reviews
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) FIND ALL BOOKINGS
    const bookings = await Booking.find({ user: req.user.id });

    // 2) FIND TOURS WITH THE RETURNED IDS
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.getMyBills = catchAsync(async (req, res, next) => {
    const bills = await Booking.find({ user: req.user.id })
        .select('-user')
        .populate({
            path: 'tour',
            select: 'name price -_id'
        });
    res.status(200).render('billing', {
        title: 'My Bills',
        bills
    })
});
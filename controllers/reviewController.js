const Review = require('../models/reviewModels');
const catchAsync = require('./../utlis/catchAsync');
const AppError = require('./../utlis/appError');
const factory = require('./factoryFunctions');

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.getMyReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ user: req.user.id });
    res.status(200).render('myReviews', {
        status: 'success',
        reviews
    });
});

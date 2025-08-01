const express = require('express');
const viewController = require('./../controllers/viewController');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.use(viewController.alerts);

router.get('/',
    // bookingController.createBookingsCheckout, 
    authController.isLoggedin,
    viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedin, viewController.getTour);
router.get('/login', authController.isLoggedin, viewController.getLoginForm);
router.get('/signup', authController.isLoggedin, viewController.getSignupForm);
router.get('/forgetPassword', authController.isLoggedin, viewController.getForgetPasswordForm);
router.get('/resetPassword/:token', viewController.getResetPasswordForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get('/bills', authController.protect, viewController.getMyBills);

module.exports = router; 
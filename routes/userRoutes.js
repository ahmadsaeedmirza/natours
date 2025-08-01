const express = require('express');
const userControllers = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', userControllers.uploadUserPhoto, userControllers.resizeUserPhoto, userControllers.updateMe);
router.delete('/deleteMe', userControllers.deleteMe);
router.get('/my-reviews', reviewController.getMyReviews);
router.get('/billing', bookingController.getMyBills);

router
    .route('/me')
    .get(userControllers.getMe, userControllers.getUser);

// RISTRICT THESE ROUTES FOR ADMIN ONLY 

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userControllers.getAllUsers);

router
    .route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser);

module.exports = router;
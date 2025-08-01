const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModels');
const catchAsync = require('./../utlis/catchAsync');
const AppError = require('./../utlis/appError');
const sendEmail = require('./../utlis/email');
const jwt = require('jsonwebtoken');
const { findById } = require('../models/tourModels');
const Email = require('./../utlis/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined;
    user.active = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email & password is provided
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // Check if that email exists
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    // If everything OK, send token
    createSendToken(user, 200, req, res);

});

exports.logout = (req, res) => {
    res.cookie('jwt', 'bahirho', {
        expiresIn: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

exports.protect = catchAsync(async (req, res, next) => {

    let token;

    // console.log('Authorization header:', req.headers.authorization);


    // 1) Getting token and check if it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access!', 401));
    }

    // 2) Verifying token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belongin to this token no longer exists!', 401));
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again!', 401));
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedin = async (req, res, next) => {

    if (req.cookies.jwt) {
        try {

            // 1) Verifying token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(new AppError('You do not have permission to perform this action!', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {

    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address!', 404));
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to users email

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to mail'
        });
    } catch (err) {
        user.passwordResetToken = undefined,
            user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the mail! Plesae try agin later'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired!'), 400);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update the passwordChangedAt property for the user
    // (handled using middeware function)

    // 4) Log the user in, send the JWT
    createSendToken(user, 200, req, res);

});

exports.updatePassword = catchAsync(async (req, res, next) => {

    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Invalid password', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    // 4) Login user, send JWT
    createSendToken(user, 200, req, res);

});
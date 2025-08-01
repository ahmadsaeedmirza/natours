const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utlis/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoute');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 1 - Global MIDDLEWARES
// IMPLEMENT CORS (ALLOW CROSS SERVER REQUESTS)
app.use(cors());
app.options('*', cors());

// SET SECURITY HTTP HEADERS
// app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: [
                "'self'",
                'https:',
                'data:',
                'https://fonts.googleapis.com',
                'https://ka-f.fontawesome.com' // ✅ Allow Font Awesome fonts
            ],
            scriptSrc: [
                "'self'",
                'https://api.mapbox.com',
                'https://cdnjs.cloudflare.com',
                'https://js.stripe.com',
                'https://kit.fontawesome.com' // ✅ Font Awesome Kit
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Needed for some Font Awesome in-kit styles
                'https://api.mapbox.com',
                'https://fonts.googleapis.com',
                'https://ka-f.fontawesome.com' // ✅ Font Awesome CSS
            ],
            connectSrc: [
                "'self'",
                'https://*.tiles.mapbox.com',
                'https://api.mapbox.com',
                'https://events.mapbox.com',
                'https://js.stripe.com',
                'ws://localhost:*',
                'ws://127.0.0.1:*',
                'https://ka-f.fontawesome.com' // ✅ Font Awesome CDN
            ],
            imgSrc: [
                "'self'",
                'data:',
                'blob:',
                'https://api.mapbox.com',
                'https://*.tiles.mapbox.com'
            ],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", 'https://js.stripe.com']
        }
    })
);




// DEVELOPMENT LOGGING
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// LIMIT REQUESTS FROM SAME IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour!'
});
app.use('/api', limiter);

// BODY PARSER (READING DATA FROM BODY INTO REQ.BODY)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingAverage',
            'ratingQuantity',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression());

// TEST MIDDLEWARE
app.use((req, res, next) => {
    next();
})

// 2 - ROUTES

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this site`, 404));
});

app.use(globalErrorHandler);

module.exports = app; 
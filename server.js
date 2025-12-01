const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN.....");
    process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// 👇 The change is right here:
mongoose
    .connect(DB, {
        bufferTimeoutMS: 15000, // Increased from the default 10000ms (10 seconds) to 15000ms (15 seconds)
    })
    .then(() => console.log("Database connection is successfull!"));

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION! SHUTTING DOWN.....");
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM REVIEVED. Shutting down gracufully...');
    server.close(() => {
        console.log('Process terminated...!!!');
    })
});
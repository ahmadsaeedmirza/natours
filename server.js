const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN.....");
    process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE;

// mongoose
//     .connect(DB)
//     .then(() => console.log("Database connection is successfull!"));

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000 // wait up to 15s for server selection
    })
    .then(() => {
        console.log('✅ Database connection successful!');
        // Start server only after DB is connected:
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => {
            console.log(`App running on port ${port}...`);
        });

        // attach server to global so unhandledRejection can close it
        global.__server = server;
    })
    .catch(err => {
        console.error('❌ DB connection failed:', err);
    });

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
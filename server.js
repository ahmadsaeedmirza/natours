// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });

// process.on('uncaughtException', err => {
//     console.log(err.name, err.message);
//     console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN.....");
//     process.exit(1);
// });

// const app = require('./app');

// const DB = process.env.DATABASE;

// // mongoose
// //     .connect(DB)
// //     .then(() => console.log("Database connection is successfull!"));

// mongoose
//     .connect(DB, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         serverSelectionTimeoutMS: 15000 // wait up to 15s for server selection
//     })
//     .then(() => {
//         console.log('✅ Database connection successful!');
//         // Start server only after DB is connected:
//         const port = process.env.PORT || 3000;
//         const server = app.listen(port, () => {
//             console.log(`App running on port ${port}...`);
//         });

//         // attach server to global so unhandledRejection can close it
//         global.__server = server;
//     })
//     .catch(err => {
//         console.error('❌ DB connection failed:', err);
//     });

// const port = process.env.PORT;
// const server = app.listen(port, () => {
//     console.log(`App running on port ${port}`);
// });

// process.on('unhandledRejection', err => {
//     console.log(err.name, err.message);
//     console.log("UNHANDLED REJECTION! SHUTTING DOWN.....");
//     server.close(() => {
//         process.exit(1);
//     });
// });

// process.on('SIGTERM', () => {
//     console.log('SIGTERM REVIEVED. Shutting down gracufully...');
//     server.close(() => {
//         console.log('Process terminated...!!!');
//     })
// });


const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE;

// This will cache the database connection. 
// Vercel will keep the process alive for a while, reusing the connection for new requests.
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    try {
        const db = await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });
        cachedDb = db;
        console.log('✅ Database connection successful!');
        return cachedDb;
    } catch (err) {
        console.error('❌ DB connection failed:', err);
        // Rethrow the error to ensure the function fails if the connection cannot be established
        throw err;
    }
}

// Wrap the app in a Vercel-compatible handler
module.exports = async (req, res) => {
    await connectToDatabase();
    return app(req, res);
};

// Remove all app.listen() and related code since Vercel handles the server.
// These process listeners are also unnecessary in a stateless serverless environment,
// as Vercel manages the process lifecycle.
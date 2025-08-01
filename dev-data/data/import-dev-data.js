const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./../../models/tourModels');
const User = require('./../../models/userModels');
const Review = require('../../models/reviewModels');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then(() => console.log("Database connection is successfull!"));

// READING DATA FROM THE FILE 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


//IMPORT DATA 
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("Data loaded into DATABASE....");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("All the existing data is deleated...");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// console.log(process.argv);

if (process.argv[2] === '--delete') {
    deleteData();
} else if (process.argv[2] == '--import') {
    importData();
}

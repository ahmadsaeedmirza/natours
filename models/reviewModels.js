const mongoose = require('mongoose');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review can't be empty!"]
    },
    rating: {
        type: Number,
        max: 5,
        min: 1
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour!']
    }
    ,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user!']
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
})

reviewSchema.statics.calAverageRating = async function (tourID) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourID }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function () {
    this.constructor.calAverageRating(this.tour);
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.model.findOne(this.getQuery());
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calAverageRating(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
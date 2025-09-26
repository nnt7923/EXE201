const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    place: {
        type: Schema.Types.ObjectId,
        ref: 'Place'
    },
    customPlace: {
        type: String
    },
    startTime: {
        type: String, // e.g., "09:00"
        required: true
    },
    endTime: {
        type: String, // e.g., "11:30"
    },
    activityType: {
        type: String,
        enum: ['EAT', 'VISIT', 'ENTERTAINMENT', 'TRAVEL', 'OTHER'],
        required: true
    },
    notes: {
        type: String
    }
});

const itinerarySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLIC'],
        default: 'DRAFT'
    },
    activities: [activitySchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Itinerary', itinerarySchema);

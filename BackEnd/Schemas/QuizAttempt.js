const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
    {

        id: {
            type: Number,
            required : true,
        },

        attemptedBy: {
            type: String,
            required: true,
        },

        time: {
            type: Date,
            default: Date.now,
        },
        answers:{
            type: [Number],
        },
        score: {
            type : Number,
            required: true,
            default: 0,
        },
    },
    {
        collection: "QuizAttemptInfo",
    }
);

mongoose.model("QuizAttemptInfo" , QuizAttemptSchema);
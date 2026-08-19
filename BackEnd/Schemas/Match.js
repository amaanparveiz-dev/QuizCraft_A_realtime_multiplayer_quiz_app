const mongoose = require("mongoose");


const MatchSchema = new mongoose.Schema(
    {
        matchID: {
            type: String,
            required: true,
        },

        user1: {
            type: String,
            required: true,
        },

        user2: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            default: Date.now,
        },


        status: {
            type: String,
            enum: ["waiting", "live", "finished"],
            default: "waiting",
        },


        quizID: {
            type: Number,
            required: true,
        },

        user1Score: {
            type: Number,
            default: 0,
        },


        user2Score: {
            type: Number,
            default: 0,
        },


        winner: {
            type: String,
            default: null,
        },

    },

    {
        collection: "MatchInfo",
    }

);

module.exports = mongoose.model("Match", MatchSchema);

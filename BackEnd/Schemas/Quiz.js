const mongoose = require("mongoose");


const QuestionSchema = new mongoose.Schema(
    {
        question: {
            type : String,
            required:true,
        },

        choices:{
            type: [String],
            required: true,
        },
        
        correctChoice : {
            type: Number,
            required: true,
        },
    }
);

const QuizSchema = new mongoose.Schema(

{
    id:{
        type: Number,
        required: true,
    },

    createdBy:{
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: { 
        type: String,
        required: true,
    },
    difficulty:{ 
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"],
    },
    time:{
        type: Number,
        required: true,
    },
    publicc:{ 
        type: Boolean,
        required: true,
        default: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },

    totalQuestions:{
        type: Number,
        required: true,
    },
    questions: {
        type: [QuestionSchema],
        required: true,
    },

    totalAttempts: {
        type: Number,
        required: true,
        default: 0,
    },

    marks: {
        type: Number,
        required : true,
    },

    attemptedBy: {
        type : [String],
        default: [],
    },
},
{
        collection: "QuizInfo",
    }

);

module.exports = mongoose.model("QuizInfo", QuizSchema);

const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,

        },

        email: {
            type: String,
            required: true,
            trim: true,

        },

        password: {
            type: String,
            required: true,
            trim: true,

        },

        institution: {
            type: String,
            required: true,
            trim: true,

        },
    },
    {
        collection: "TeacherInfo",
    }
);

mongoose.model("TeacherInfo" , TeacherSchema);
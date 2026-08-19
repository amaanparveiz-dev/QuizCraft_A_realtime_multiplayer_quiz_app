const mongoose = require("mongoose");


const MatchLineSchema = new mongoose.Schema(
    {
        user1:{
            type: String,
            required: true,
        },

         user2:{
            type: String,
        },

        status: {
            type: String,
            enum: ["waiting", "live", "finished"],
            default: "waiting",
    },

    },

{
        collection: "MatchLineInfo",
    }
);

mongoose.model("MatchLineInfo" , MatchLineSchema);

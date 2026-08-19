const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema(
    {
    id:{
        type:String,
        required:true,
    },
       count :{
        type: Number,
        required:true
       }
    },
    {
        collection: "CountInfo",
    }
);

mongoose.model("CountInfo" , CounterSchema);
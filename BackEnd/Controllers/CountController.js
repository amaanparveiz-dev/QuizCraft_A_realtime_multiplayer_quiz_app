const mongoose = require("mongoose");

require("../Schemas/Counter");

const Count = mongoose.model("CountInfo");

const addID = async (req, res) => {
  try {
    const quizCounter = await Count.findOneAndUpdate(
      { id: "QuizID" },        
      { $inc: { count: 1 } },  
      { new: true, upsert: true } 
    );

    res.send({ status: "OK", data: { count: quizCounter.count } });
  } catch (error) {
    res.send({ status: "Error", data: error.message });
  }
};


const getID = async (req, res) => {
  try {
    let lastQuiz = await Count.findOne({ id: "QuizID" });

    if (!lastQuiz) {
      lastQuiz = await Count.create({
        id: "QuizID",
        count: 1,
      });
    }

    res.send({ status: "OK", data: { count: lastQuiz.count } });
  } catch (error) {
    res.send({ status: "Error", data: error.message });
  }
};


module.exports = {
  getID,
  addID,
};

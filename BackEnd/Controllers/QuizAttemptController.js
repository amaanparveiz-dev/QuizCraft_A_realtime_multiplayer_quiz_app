const mongoose = require("mongoose");

require("../Schemas/Quiz");
require("../Schemas/QuizAttempt");


const Quiz = mongoose.model("QuizInfo");
const QuizAttempt = mongoose.model("QuizAttemptInfo");


const startQuiz = async (req, res) => {
  const { id, attemptedBy } = req.body;

  if (!id || !attemptedBy) {
    return res.send({ status: "Error", data: "All fields are required" });
  }

  try {
    const quizId = Number(id); // convert to Number to match schema

    // Create the quiz attempt
    await QuizAttempt.create({
      id: quizId,
      attemptedBy,
    });
    console.log("QuizAttempt created for:", attemptedBy, "Quiz ID:", quizId);

    // Update the quiz document
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id: quizId },
      { 
        $push: { attemptedBy },   // always adds, allows duplicates
        $inc: { totalAttempts: 1 }
      },
      { new: true }
    );

    console.log("Updated Quiz:", updatedQuiz);

    res.send({ status: "OK", data: "Quiz Started" });
  } catch (error) {
    console.error("Error in startQuiz:", error);
    res.send({ status: "Error", data: error });
  }
};


const loadQuestion = async (req, res) => {
  const { id, index } = req.body;

  try {
    const quiz = await Quiz.findOne({ id });

    if (!quiz) {
      return res.json({ status: "NO", data: "Quiz Not Found" });
    }

    res.json({
      status: "OK",
      question: quiz.questions[index].question,
      choices: quiz.questions[index].choices,
      correctChoice: quiz.questions[index].correctChoice
    });
  }

  catch (e) {
    console.error(e);
    res.json({ status: "Error", error: e });
  }
};

const saveAnswer = async (req, res) => {
  const { id, attemptedBy, choice, index, correctChoice } = req.body;

  try {
    const quizattempt = await QuizAttempt.findOne({ id, attemptedBy });

    if (!quizattempt) {
      return res.json({ status: "Error", message: "Quiz attempt not found" });
    }

    if (!quizattempt.answers) {
      quizattempt.answers = [];
    }

    quizattempt.answers[index] = choice;

    if (choice === correctChoice) {
      quizattempt.score = (quizattempt.score || 0) + 1;
    }

    await quizattempt.save();

    res.json({ status: "OK", message: "Answer saved successfully" });

  } catch (error) {
    console.error("Error saving answer:", error);
    res.json({ status: "Error", message: error.message });
  }
};


module.exports = {
  startQuiz,
  loadQuestion,
  saveAnswer,
};

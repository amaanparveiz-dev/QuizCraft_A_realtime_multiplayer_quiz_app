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
    const attempt = await QuizAttempt.create({
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

    // Return the attempt's own unique id so the frontend can reference
    // this exact attempt going forward, instead of {id, attemptedBy}
    // which is ambiguous once a student retakes a quiz.
    res.send({ status: "OK", data: "Quiz Started", attemptId: attempt._id });
  } catch (error) {
    console.error("Error in startQuiz:", error);
    res.send({ status: "Error", data: error });
  }
};


const loadQuestion = async (req, res) => {
  const { id, index, attemptId } = req.body;

  try {
    const quiz = await Quiz.findOne({ id });

    if (!quiz) {
      return res.json({ status: "NO", data: "Quiz Not Found" });
    }

    // No more questions left -> quiz is finished, send back the final score
    if (!quiz.questions || index >= quiz.questions.length) {
      let score = 0;

      if (attemptId) {
        const attempt = await QuizAttempt.findById(attemptId);
        score = attempt ? attempt.score : 0;
      }

      return res.json({
        status: "OK",
        finished: true,
        score,
        totalQuestions: quiz.questions.length
      });
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
  const { attemptId, choice, index, correctChoice } = req.body;

  try {
    if (!attemptId) {
      return res.json({ status: "Error", message: "Missing attemptId" });
    }

    const quizattempt = await QuizAttempt.findById(attemptId);

    if (!quizattempt) {
      return res.json({ status: "Error", message: "Quiz attempt not found" });
    }

    if (!quizattempt.answers) {
      quizattempt.answers = [];
    }

    // Only count the answer once per question, even if saveAnswer is
    // somehow called twice for the same index (e.g. a retried request).
    const alreadyAnswered = quizattempt.answers[index] !== undefined && quizattempt.answers[index] !== null;

    quizattempt.answers[index] = choice;

    if (!alreadyAnswered && choice === correctChoice) {
      quizattempt.score = (quizattempt.score || 0) + 1;
    }

    await quizattempt.save();

    res.json({ status: "OK", message: "Answer saved successfully" });

  } catch (error) {
    console.error("Error saving answer:", error);
    res.json({ status: "Error", message: error.message });
  }
};


// Average score (%) across every quiz a student has attempted
const getStudentAvgScore = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.json({ status: "Error", data: "Username is required" });
  }

  try {
    const attempts = await QuizAttempt.find({ attemptedBy: username });

    if (!attempts || attempts.length === 0) {
      return res.json({ status: "OK", data: { avgScore: null } });
    }

    const quizIds = [...new Set(attempts.map(a => a.id))];
    const quizzes = await Quiz.find({ id: { $in: quizIds } }, { id: 1, totalQuestions: 1 });

    const totalQuestionsById = {};
    quizzes.forEach(q => { totalQuestionsById[q.id] = q.totalQuestions; });

    const totalPercent = attempts.reduce((sum, a) => {
      const totalQuestions = totalQuestionsById[a.id] || 1;
      return sum + ((a.score || 0) / totalQuestions) * 100;
    }, 0);

    const avgScore = Math.round(totalPercent / attempts.length);

    res.json({ status: "OK", data: { avgScore } });
  } catch (error) {
    console.error("Error computing student avg score:", error);
    res.json({ status: "Error", data: error.message });
  }
};


module.exports = {
  startQuiz,
  loadQuestion,
  saveAnswer,
  getStudentAvgScore,
};
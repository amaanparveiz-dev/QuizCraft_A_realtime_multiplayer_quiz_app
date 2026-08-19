const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("../Schemas/Quiz");
require("../Schemas/QuizAttempt");

const Quiz = mongoose.model("QuizInfo");
const QuizAttempt = mongoose.model("QuizAttemptInfo");

// Helper: attach an avgScore (%) field to a quiz based on its attempts
const withAvgScore = async (quiz) => {
  const quizObj = quiz.toObject ? quiz.toObject() : quiz;

  try {
    const attempts = await QuizAttempt.find({ id: quizObj.id });

    if (!attempts || attempts.length === 0 || !quizObj.totalQuestions) {
      quizObj.avgScore = null;
      return quizObj;
    }

    const totalPercent = attempts.reduce((sum, a) => {
      return sum + ((a.score || 0) / quizObj.totalQuestions) * 100;
    }, 0);

    quizObj.avgScore = Math.round(totalPercent / attempts.length);
  } catch (e) {
    quizObj.avgScore = null;
  }

  return quizObj;
};


const registerQuiz = async (req, res) => {
  const { id, createdBy, title, subject, description, difficulty, time, publicc, totalQuestions, correctAnswer, marks, questions, choices } = req.body;

  if (!id || !createdBy || !title || !subject || !description || !difficulty || !time || !totalQuestions || !marks || !questions || choices) {
    return res.send({ status: "Error", data: "All fields are required" });
  }

  try {

    await Quiz.create({
      id,
      createdBy,
      title,
      subject,
      description,
      difficulty,
      time,
      publicc,
      totalQuestions,
      questions,
      choices,
      correctAnswer,
      marks
    });


    res.send({ status: "OK", data: "Quiz Created" });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};


const getAllQuizes = async (req, res) => {
  try {
    const quiz = await Quiz.find({ publicc: true });

    if (!quiz) {
      return res.send({ status: "Error", data: "No Quizes Found" });
    }

    const quizzesWithAvg = await Promise.all(quiz.map(withAvgScore));

    res.send({ status: "OK", data: quizzesWithAvg });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }

};


const getTeacherQuizes = async (req, res) => {
  const createdby = req.body.username;
  try {
    const quiz = await Quiz.find({ createdBy: createdby });

    if (!quiz || quiz.length === 0) {
      return res.send({ status: "Error", data: "No Quizes Found" });
    }

    const quizzesWithAvg = await Promise.all(quiz.map(withAvgScore));

    res.send({ status: "OK", data: quizzesWithAvg });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};

const getQuizByID = async (req, res) => {
  const id = req.body.quizID;
  try {
    const quiz = await Quiz.findOne({ id: id });

    if (!quiz || quiz.length === 0) {
      return res.send({ status: "Error", data: "No Quizes Found" });
    }

    const quizWithAvg = await withAvgScore(quiz);

    res.send({ status: "OK", data: quizWithAvg });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};

// Update a quiz's details and/or its questions
const updateQuiz = async (req, res) => {
  const { id, title, subject, description, difficulty, time, marks, publicc, questions } = req.body;

  if (!id) {
    return res.send({ status: "Error", data: "Quiz id is required" });
  }

  try {
    const update = {};

    if (title !== undefined) update.title = title;
    if (subject !== undefined) update.subject = subject;
    if (description !== undefined) update.description = description;
    if (difficulty !== undefined) update.difficulty = difficulty;
    if (time !== undefined) update.time = Number(time);
    if (marks !== undefined) update.marks = Number(marks);
    if (publicc !== undefined) update.publicc = publicc;
    if (questions !== undefined) {
      update.questions = questions;
      update.totalQuestions = questions.length;
    }

    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id: Number(id) },
      { $set: update },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.send({ status: "Error", data: "Quiz Not Found" });
    }

    const quizWithAvg = await withAvgScore(updatedQuiz);

    res.send({ status: "OK", data: quizWithAvg });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};

// Delete a quiz (and its attempts)
const deleteQuiz = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({ status: "Error", data: "Quiz id is required" });
  }

  try {
    const deleted = await Quiz.findOneAndDelete({ id: Number(id) });

    if (!deleted) {
      return res.send({ status: "Error", data: "Quiz Not Found" });
    }

    await QuizAttempt.deleteMany({ id: Number(id) });

    res.send({ status: "OK", data: "Quiz Deleted" });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};

// Average score (%) across every quiz a teacher has created
const getTeacherAvgScore = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.send({ status: "Error", data: "Username is required" });
  }

  try {
    const quizzes = await Quiz.find({ createdBy: username }, { id: 1, totalQuestions: 1 });

    if (!quizzes || quizzes.length === 0) {
      return res.send({ status: "OK", data: { avgScore: null } });
    }

    const totalQuestionsById = {};
    quizzes.forEach(q => { totalQuestionsById[q.id] = q.totalQuestions; });

    const attempts = await QuizAttempt.find({ id: { $in: quizzes.map(q => q.id) } });

    if (!attempts || attempts.length === 0) {
      return res.send({ status: "OK", data: { avgScore: null } });
    }

    const totalPercent = attempts.reduce((sum, a) => {
      const totalQuestions = totalQuestionsById[a.id] || 1;
      return sum + ((a.score || 0) / totalQuestions) * 100;
    }, 0);

    const avgScore = Math.round(totalPercent / attempts.length);

    res.send({ status: "OK", data: { avgScore } });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};


module.exports = {
  registerQuiz,
  getAllQuizes,
  getTeacherQuizes,
  getQuizByID,
  updateQuiz,
  deleteQuiz,
  getTeacherAvgScore,
};
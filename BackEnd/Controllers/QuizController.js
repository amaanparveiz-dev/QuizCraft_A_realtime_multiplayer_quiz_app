const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("../Schemas/Quiz");

const Quiz = mongoose.model("QuizInfo");


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


    res.send({ status: "OK", data: quiz });
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


    res.send({ status: "OK", data: quiz });
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

    res.send({ status: "OK", data: quiz });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};


module.exports = {
  registerQuiz,
  getAllQuizes,
  getTeacherQuizes,
  getQuizByID,
};

const express = require('express');

const router = express.Router();
const {
  startQuiz,
  loadQuestion,
  saveAnswer,
  getStudentAvgScore
} = require('../Controllers/QuizAttemptController');

router.post('/start-quiz', startQuiz);

router.post('/load-question' , loadQuestion);

router.post('/save-answer' , saveAnswer);

router.post('/get-student-avg-score', getStudentAvgScore);

module.exports = router;
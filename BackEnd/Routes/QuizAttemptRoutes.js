const express = require('express');

const router = express.Router();
const {
  startQuiz,
  loadQuestion,
  saveAnswer
} = require('../Controllers/QuizAttemptController');

router.post('/start-quiz', startQuiz);

router.post('/load-question' , loadQuestion);

router.post('/save-answer' , saveAnswer);

module.exports = router;
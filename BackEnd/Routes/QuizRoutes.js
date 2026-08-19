const express = require('express');

const router = express.Router();
const {
    registerQuiz,
    getAllQuizes,
    getTeacherQuizes,
    getAvgScore,
    getQuizByID,

} = require('../Controllers/QuizController');

router.post('/register-quiz', registerQuiz);

router.get('/get-all-quizes' , getAllQuizes);

router.post('/get-teacher-quizes' , getTeacherQuizes);

router.post('/get-quiz-by-id' , getQuizByID);



module.exports = router;
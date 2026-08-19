const express = require('express');

const router = express.Router();
const {
    registerQuiz,
    getAllQuizes,
    getTeacherQuizes,
    getQuizByID,
    updateQuiz,
    deleteQuiz,
    getTeacherAvgScore,

} = require('../Controllers/QuizController');

router.post('/register-quiz', registerQuiz);

router.get('/get-all-quizes' , getAllQuizes);

router.post('/get-teacher-quizes' , getTeacherQuizes);

router.post('/get-quiz-by-id' , getQuizByID);

router.post('/update-quiz', updateQuiz);

router.post('/delete-quiz', deleteQuiz);

router.post('/get-teacher-avg-score', getTeacherAvgScore);



module.exports = router;
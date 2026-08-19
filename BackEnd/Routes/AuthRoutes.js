const express = require('express');

const router = express.Router();
const {
    registerStudent,
    registerTeacher,
    loginStudent,
    loginTeacher
} = require('../Controllers/AuthController');

router.post('/register-student', registerStudent);
router.post('/login-student', loginStudent);

router.post('/register-teacher', registerTeacher);
router.post('/login-teacher', loginTeacher);

module.exports = router;
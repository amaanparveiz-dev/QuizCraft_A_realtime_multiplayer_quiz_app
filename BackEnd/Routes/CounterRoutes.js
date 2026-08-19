const express = require('express');

const router = express.Router();
const {
    getID,
    addID
} = require('../Controllers/CountController');

router.post('/get-id', getID);
router.post('/add-id', addID);



module.exports = router;
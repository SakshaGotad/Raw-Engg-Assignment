const express = require('express');
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: 'uploads/' });
const transcribecontroller =  require('../controller/uploadController')

router.post('/',upload.single('audio'),transcribecontroller.transcribeAudio);

module.exports = router;
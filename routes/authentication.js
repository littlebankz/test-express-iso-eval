const express = require('express');
const router = express.Router();
const { checkCredential, checkAuthToken } = require('../controllers/authentication');

router
    .route('/')
    .post(checkCredential);

router
    .route('/authtoken')
    .post(checkAuthToken);
    
module.exports = router;
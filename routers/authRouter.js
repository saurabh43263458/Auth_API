const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js');
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post("/logout",authController.logout);
router.patch("/sendVerfication",authController.sendVerification);
router.patch("/verifiy",authController.verifyVerificationCode);
module.exports = router;

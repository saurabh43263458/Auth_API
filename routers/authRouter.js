const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js');
const {identifier} = require('../middlewares/identification.js');
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post("/logout",authController.logout);
router.patch("/sendVerification",identifier,authController.sendVerification);
router.patch("/verifiy",identifier,authController.verifyVerificationCode);
router.patch("/changepassword",identifier,authController.changePassword);
router.patch("/forgotPasswordCode",authController.sendforgotedPasswordCode);
router.patch("/verifyforgotPasswordCode",authController.verifyforgotPasswordCode);
module.exports = router;

// routes/MailOtp.route.js
const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("./MailOtp.controller");
const UserSecure = require("../user/user.secure");

router.post("/sendotp/:email?", UserSecure, sendOtp);
router.post("/verifyotp/:email?/:OTP?", UserSecure, verifyOtp);

module.exports = router;
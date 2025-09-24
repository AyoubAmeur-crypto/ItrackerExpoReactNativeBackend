const express = require('express')
const verifyToken = require("../middleware/verifytoken")

const {login,logout,signUp,sendOtp,verifyOtp,verifyEmailCheck,sendOtpForPassword,verifyOtpPassword,UpdatePassword} = require("../controllers/authController")

const router = express.Router()

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",logout)
router.post("/otpCode",verifyToken,sendOtp)
router.post("/verifyOtp",verifyToken,verifyOtp)
router.post("/verifyMailPassword",verifyEmailCheck)
router.post("/sendPasswordOtp",sendOtpForPassword)
router.post("/verifyOtpPasssword",verifyOtpPassword)
router.post("/updatePassword",UpdatePassword)


module.exports = router
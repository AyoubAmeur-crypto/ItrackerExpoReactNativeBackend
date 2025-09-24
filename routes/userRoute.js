const express = require("express")
const verifyToken = require("../middleware/verifytoken")
const {getData} = require('../controllers/userInfo')

const router = express.Router()


router.get('/userInfo',verifyToken,getData)


module.exports = router
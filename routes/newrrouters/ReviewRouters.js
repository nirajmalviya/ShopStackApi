const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")



const {CreateReview} = require("../../controllers/ReviewController")
const {LoadAllRating} = require("../../controllers/ReviewController")


router.post("/CreateReview",CreateReview,auth)
router.post("/LoadAllRating",LoadAllRating,auth)

module.exports = router
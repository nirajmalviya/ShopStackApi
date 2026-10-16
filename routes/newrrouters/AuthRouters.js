const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")

const {Login} = require("../../controllers/AuthController")
const {Register} = require("../../controllers/AuthController")


router.post("/Login",Login,auth)
router.post("/Register",Register,auth)

module.exports = router
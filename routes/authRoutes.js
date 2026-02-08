const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { askAI } = require("../controllers/aiController");

router.post("/signup", signup);
router.post("/login", login);
module.exports = router;

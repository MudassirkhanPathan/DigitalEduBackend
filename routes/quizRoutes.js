const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authMiddleware = require("../middlewares/authMiddleware");

//  Route mappings
router.post("/first", quizController.getFirstBatch);
router.post("/next", quizController.getNextBatch);
router.post("/submit", authMiddleware, quizController.submitScore); // yehi rakho

module.exports = router;

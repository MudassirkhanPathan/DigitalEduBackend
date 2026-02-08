const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true }, // 1 - 25
  subject: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
});

module.exports = mongoose.model("quizzes", quizSchema);

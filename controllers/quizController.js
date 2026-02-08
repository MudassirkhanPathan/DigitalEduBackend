const Quiz = require("../models/Quiz");
const User = require("../models/User");

// First batch
exports.getFirstBatch = async (req, res) => {
  try {
    const { subject } = req.body;
    const quiz = await Quiz.find({
      subject: { $regex: new RegExp("^" + subject + "$", "i") },
    })
      .sort({ serialNumber: 1 })
      .limit(5);

    if (!quiz.length)
      return res.status(404).json({ message: "No questions found" });

    res.json(quiz);
  } catch (err) {
    console.error("getFirstBatch Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// Next batch
exports.getNextBatch = async (req, res) => {
  try {
    const { subject, batch } = req.body;

    const quiz = await Quiz.find({
      subject: { $regex: new RegExp("^" + subject + "$", "i") },
    })
      .sort({ serialNumber: 1 })
      .skip((batch - 1) * 5)
      .limit(5);

    if (!quiz.length)
      return res.status(404).json({ message: "No more questions!" });

    res.json(quiz);
  } catch (err) {
    console.error("getNextBatch Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const userId = req.user.id; // middleware se aaya
    const { subject, score } = req.body;

    if (!subject || score === undefined) {
      return res
        .status(400)
        .json({ message: "Subject and score are required" });
    }

    //   User find karo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //   Score push karo
    user.quizScores.push({ subject, score });

    //   Save karo
    await user.save();

    res.json({
      message: "Score submitted successfully",
      quizScores: user.quizScores,
    });
  } catch (err) {
    console.error("Submit score error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

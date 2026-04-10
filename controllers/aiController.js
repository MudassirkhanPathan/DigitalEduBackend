const axios = require("axios");

const askAI = async (req, res) => {
  console.log("Inside askAI Controller");

  try {
    const { question } = req.body;

    //  Validation
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Check API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "API key missing" });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // ✅ timeout added (10 sec)
      },
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer from AI";

    return res.json({ answer });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "AI server busy. Try again later.",
    });
  }
};

module.exports = { askAI };

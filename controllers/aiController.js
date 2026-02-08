const axios = require("axios");

const askAI = async (req, res) => {
  console.log("Inside askAI Controller");
  const { question } = req.body;
  console.log("Question received:", question);

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: question }], // FIX: yaha `prompt` nahi `question` use hoga
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const answer =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer from Gemini";

    res.json({ answer });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Error fetching answer. Please try again." });
  }
};

module.exports = { askAI };

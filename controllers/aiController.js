const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askAI = async (req, res) => {
  console.log("Inside askAI Controller");

  try {
    const { question } = req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key missing" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap
      messages: [{ role: "user", content: question }],
    });

    const answer = response.choices[0].message.content;

    return res.json({ answer });
  } catch (error) {
    console.error("OpenAI Error:", error.message);

    return res.status(500).json({
      answer: "⚠️ AI server error. Try again later.",
    });
  }
};

module.exports = { askAI };

const Contact = require("../models/Contact");

// Save contact form data
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    return res.status(201).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

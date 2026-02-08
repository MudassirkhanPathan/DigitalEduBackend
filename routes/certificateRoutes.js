const express = require("express");
const { generateCertificate } = require("../controllers/Certificate");

const router = express.Router();

// Route -> Controller
router.post("/generate", generateCertificate);

module.exports = router;

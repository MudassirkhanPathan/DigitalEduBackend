const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/config");
const path = require("path");

const app = express();

//  Allowed origins
const allowedOrigins = [
  "https://digital-edu-frontend.vercel.app",
  "https://digital-edu-frontend-r5mhfltb4-mudassir-khan-s-projects.vercel.app",
];

//  CORS setup (BEST VERSION)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

//  Preflight fix (VERY IMPORTANT)
app.options("*", cors());

//  Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  DB connect
connectDB();

//  Static folder
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

//  Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

//  Routes
app.use("/api/certificate", require("./routes/certificateRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api", require("./routes/contactRoutes"));

//  Error handler (important)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

//  Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/config");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB
connectDB();
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

// Routes
app.use("/api/certificate", require("./routes/certificateRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api", require("./routes/contactRoutes"));
app.use(
  cors({
    origin: "https://digital-edu-frontend.vercel.app",
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

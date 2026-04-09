const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/config");
const path = require("path");

const app = express();

// middleware
app.use(
  cors({
    origin: "https://digital-edu-frontend.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
connectDB();

// static
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

//  ADD THIS ROUTE
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running " });
});
app.get("/", (req, res) => {
  res.send("Backend is running ");
});
// routes
app.use(
  "https://digitaledubackend.onrender.com/api/certificate",
  require("./routes/certificateRoutes"),
);
app.use(
  "https://digitaledubackend.onrender.com/api/auth",
  require("./routes/authRoutes"),
);
app.use(
  "https://digitaledubackend.onrender.com/api",
  require("./routes/aiRoutes"),
);
app.use(
  "https://digitaledubackend.onrender.com/api/payment",
  require("./routes/paymentRoutes"),
);
app.use(
  "https://digitaledubackend.onrender.com/api/quiz",
  require("./routes/quizRoutes"),
);
app.use(
  "https://digitaledubackend.onrender.com/api",
  require("./routes/contactRoutes"),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const userRoutes = require("./routes/userRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const weeklyPlanRoutes = require("./routes/weeklyPlanRoutes");
const exerciseVideoRoutes = require("./routes/exerciseVideoRoutes");

const errorHandler = require("./middleware/errorHandler");
const securityMiddleware = require("./middleware/securityMiddleware");
const { swaggerUi, specs } = require("./config/swagger");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://appdoandbefitness.netlify.app",
      "https://doandbefitness.com",
      "https://www.doandbefitness.com",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
securityMiddleware(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/auth", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/weekly-plan", weeklyPlanRoutes);
app.use("/exercise-videos", exerciseVideoRoutes);

// Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
securityMiddleware(app);

mongoose
  .connect("mongodb://appUser:%40db5780bd@localhost:27017/doandbefitness", {
    authSource: "doandbefitness",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

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

app.listen(5000, () => console.log("Server running on port 5000"));

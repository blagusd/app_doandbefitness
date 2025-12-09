const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const planRoutes = require("./routes/planRoutes");
const errorHandler = require("./middleware/errorHandler");
const securityMiddleware = require("./middleware/securityMiddleware");
const { swaggerUi, specs } = require("./swagger");

const app = express();
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
app.use("/api/plans", planRoutes);

// Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(errorHandler);

app.listen(5000, () => console.log("Server running on port 5000"));

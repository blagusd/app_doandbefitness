const express = require("express");
const router = express.Router();
const WeeklyPlan = require("../models/WeeklyPlan");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { userId, weekNumber, days } = req.body;

    if (!userId || !weekNumber || !days) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let plan = await WeeklyPlan.findOne({ userId, weekNumber });

    if (plan) {
      plan.days = days;
      await plan.save();
      return res.json({ success: true, weeklyPlan: plan });
    }

    const newPlan = new WeeklyPlan({ userId, weekNumber, days });
    await newPlan.save();

    res.json({ success: true, weeklyPlan: newPlan });
  } catch (err) {
    console.error("Error saving weekly plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/:weekNumber", authMiddleware, async (req, res) => {
  try {
    const { userId, weekNumber } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const plan = await WeeklyPlan.findOne({ userId, weekNumber });

    if (!plan) return res.status(404).json({ message: "Not found" });

    res.json(plan);
  } catch (err) {
    console.error("Error fetching weekly plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const plans = await WeeklyPlan.find({ userId }).sort({ weekNumber: 1 });
    res.json(plans || []);
  } catch (err) {
    console.error("Error fetching weekly plans:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete(
  "/:userId/:weekNumber",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { userId, weekNumber } = req.params;

      const deleted = await WeeklyPlan.findOneAndDelete({ userId, weekNumber });

      if (!deleted) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting weekly plan:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post("/update-exercise", authMiddleware, async (req, res) => {
  try {
    const { weeklyPlanId, day, exerciseId, sets, reps, weight } = req.body;

    const plan = await WeeklyPlan.findById(weeklyPlanId);
    if (!plan)
      return res.status(404).json({ message: "Weekly plan not found" });

    const dayObj = plan.days.find((d) => d.day === day);
    if (!dayObj) return res.status(404).json({ message: "Day not found" });

    const exercise = dayObj.exercises.find(
      (ex) => ex.exerciseId.toString() === exerciseId,
    );
    if (!exercise)
      return res.status(404).json({ message: "Exercise not found" });

    if (sets !== undefined) exercise.actualSets = sets;
    if (reps !== undefined) exercise.actualReps = reps;
    if (weight !== undefined) exercise.actualWeight = weight;

    await plan.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating exercise:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

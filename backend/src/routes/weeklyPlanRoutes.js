const express = require("express");
const router = express.Router();

const Plan = require("../models/Plan");
const Exercise = require("../models/Exercise");
const WeeklyPlan = require("../models/WeeklyPlan");

// 1) Assign plan to user → create WeeklyPlan
router.post("/assign", async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const plan = await Plan.findById(planId).populate("workouts.exercises");
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const weeklyPlan = new WeeklyPlan({
      userId,
      planId,
      weekNumber: plan.weekNumber,
      days: plan.workouts.map((w) => ({
        day: w.day,
        exercises: w.exercises.map((ex) => ({
          exerciseId: ex._id,
          name: ex.name,
          youtubeLink: ex.youtubeLink || "",
          trainerNotes: ex.notes || "",

          plannedSets: ex.sets || 0,
          plannedReps: ex.reps || 0,
          plannedWeight: ex.weight || 0,

          actualSets: null,
          actualReps: null,
          actualWeight: null,
        })),
      })),
    });

    await weeklyPlan.save();
    res.json({ success: true, weeklyPlan });
  } catch (err) {
    console.error("Error assigning plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2) Get weekly plan for a user
router.get("/:userId", async (req, res) => {
  try {
    const plan = await WeeklyPlan.findOne({ userId: req.params.userId });

    if (!plan)
      return res.status(404).json({ message: "Weekly plan not found" });

    res.json(plan);
  } catch (err) {
    console.error("Error fetching weekly plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3) Update actual exercise results
router.post("/update-exercise", async (req, res) => {
  try {
    const { weeklyPlanId, day, exerciseId, sets, reps, weight } = req.body;

    const plan = await WeeklyPlan.findById(weeklyPlanId);
    if (!plan)
      return res.status(404).json({ message: "Weekly plan not found" });

    const dayObj = plan.days.find((d) => d.day === day);
    if (!dayObj) return res.status(404).json({ message: "Day not found" });

    const exercise = dayObj.exercises.id(exerciseId);
    if (!exercise)
      return res.status(404).json({ message: "Exercise not found" });

    exercise.actualSets = sets;
    exercise.actualReps = reps;
    exercise.actualWeight = weight;

    await plan.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating exercise:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

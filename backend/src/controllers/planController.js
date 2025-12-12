const AppError = require("../utils/AppError");
const Plan = require("../models/Plan");
const User = require("../models/User");

exports.createPlan = async (req, res) => {
  try {
    const { name, weekNumber, workouts, assignedTo } = req.body;
    const plan = new Plan({ name, weekNumber, workouts, assignedTo });
    await plan.save();

    // Add plan to the user
    await User.findByIdAndUpdate(assignedTo, {
      $push: { weeklyPlans: plan._id },
    });

    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

exports.getUserPlans = async (req, res) => {
  try {
    const userId = req.params.userId;
    const plans = await Plan.find({ assignedTo: userId }).populate(
      "workouts.exercises"
    );
    if (!plans || plans.length === 0) {
      return next(new AppError("📩 Cannot get the plans", 404));
    }
    res.status(200).json(plans);
  } catch (err) {
    next(err);
  }
};

exports.getUserPlanByWeek = async (req, res) => {
  try {
    const { userId, weekNumber } = req.params;

    const plan = await Plan.findOne({
      assignedTo: userId,
      weekNumber,
    }).populate("workouts.exercises");

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Access Denied" });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: "🚨 Server error", error: err });
  }
};

const AppError = require("../utils/AppError");
const Plan = require("../models/Plan");
const User = require("../models/User");

exports.createPlan = async (req, res, next) => {
  try {
    const { name, weekNumber, workouts, assignedTo } = req.body;

    const existing = await Plan.findOneAndDelete({
      assignedTo,
      weekNumber: Number(weekNumber),
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Plan for this week already exists" });
    }

    const plan = new Plan({
      name,
      weekNumber: Number(weekNumber),
      workouts,
      assignedTo,
    });

    await plan.save();

    await User.findByIdAndUpdate(assignedTo, {
      $push: { weeklyPlans: plan._id },
    });

    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

exports.getUserPlans = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const plans = await Plan.find({ assignedTo: userId }).populate(
      "workouts.exercises"
    );
    res.status(200).json(plans);
  } catch (err) {
    next(err);
  }
};

exports.getUserPlanByWeek = async (req, res, next) => {
  try {
    const { userId, weekNumber } = req.params;
    const week = Number(weekNumber);

    const plan = await Plan.findOne({
      assignedTo: userId,
      weekNumber: week,
    }).populate("workouts.exercises");

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Access Denied" });
    }

    res.json(plan);
  } catch (err) {
    next(err);
  }
};

exports.deletePlanByWeek = async (req, res, next) => {
  try {
    const { userId, weekNumber } = req.params;

    const deleted = await Plan.findOneAndDelete({
      assignedTo: userId,
      weekNumber: Number(weekNumber),
    });

    if (!deleted) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted" });
  } catch (err) {
    next(err);
  }
};

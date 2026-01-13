const AppError = require("../utils/AppError");
const Plan = require("../models/Plan");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.createPlan = async (req, res, next) => {
  try {
    const { name, weekNumber, workouts, assignedTo } = req.body;
    const normalizedWorkouts = workouts.map((day) => ({
      day: day.day,
      exercises: day.exercises.map((id) => new mongoose.Types.ObjectId(id)),
    }));
    await Plan.findOneAndDelete({ assignedTo, weekNumber: Number(weekNumber) });
    const plan = new Plan({
      name,
      weekNumber: Number(weekNumber),
      workouts: normalizedWorkouts,
      assignedTo,
    });
    await plan.save();
    await User.findByIdAndUpdate(assignedTo, {
      $addToSet: { weeklyPlans: plan._id },
    });
    const populated = await Plan.findById(plan._id).populate(
      "workouts.exercises"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getUserPlans = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    console.log("getUserPlans called for userId param:", req.params.userId);
    console.log("req.user from auth:", req.user);

    if (req.user.id !== userId && req.user.role !== "admin") {
      console.log("Access denied for", req.user.id);
      return res.status(403).json({ message: "🚫 Access Denied" });
    }

    const plans = await Plan.find({ assignedTo: userId }).populate(
      "workouts.exercises"
    );

    console.log("Found plans count:", plans.length);
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

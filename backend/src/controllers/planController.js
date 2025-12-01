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
    res
      .status(500)
      .json({ message: "🗒️ Error by creating a plan", error: err.message });
  }
};

exports.getUserPlans = async (req, res) => {
  try {
    const userId = req.params.userId;
    const plans = await Plan.find({ assignedTo: userId }).populate(
      "workouts.exercises"
    );
    res.status(200).json(plans);
  } catch (err) {
    res
      .status(500)
      .json({ message: "📩 Cannot get the plans", error: err.message });
  }
};

const User = require("../models/User");

exports.addProgress = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { exerciseId, sets, reps, weight } = req.body;

    const progressEntry = {
      exerciseId,
      sets,
      reps,
      weight,
      date: new Date(),
    };
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { progressEntries: progressEntry } },
      { new: true }
    ).populate("progressEntries.exerciseId");

    res.status(201).json({
      message: "🎉 Progress successfully added",
      progress: user.progressEntries,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "🚨 Error by adding progress", error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const user = await User.findById(userId).populate(
      "progressEntries.exerciseId"
    );

    res.status(200).json(user.progressEntries);
  } catch (err) {
    res
      .status(500)
      .json({ message: "🚨 Cannot catch the progress", error: err.message });
  }
};

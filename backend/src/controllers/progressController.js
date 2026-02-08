const AppError = require("../utils/AppError");
const User = require("../models/User");

exports.addProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { weight, progressPhotos } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (weight) {
      user.weightHistory.push({ weight, date: new Date() });
    }

    if (progressPhotos) {
      if (!user.progressPhotos) {
        user.progressPhotos = { front: [], side: [], back: [] };
      }

      ["front", "side", "back"].forEach((pos) => {
        if (progressPhotos[pos]) {
          user.progressPhotos[pos].push(...progressPhotos[pos]);
        }
      });
    }

    await user.save();

    res.status(201).json({
      message: "Progress saved",
      progressPhotos: user.progressPhotos,
      weightHistory: user.weightHistory,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT
    const user = await User.findById(userId).populate(
      "progressEntries.exerciseId",
    );

    res.status(200).json(user.progressEntries);
  } catch (err) {
    next(err);
  }
};

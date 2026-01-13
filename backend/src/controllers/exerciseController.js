const AppError = require("../utils/AppError");
const Exercise = require("../models/Exercise");

exports.createExercise = async (req, res, next) => {
  try {
    const { name, youtubeLink, muscleGroup, notes, reps, sets, weight } =
      req.body;
    const exercise = new Exercise({
      name,
      youtubeLink,
      muscleGroup,
      notes,
      reps,
      sets,
      weight,
    });
    await exercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
};

exports.getAllExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find();
    if (!exercises || exercises.length === 0) {
      return next(new AppError("✋ Cannot catch the exercises", 404));
    }
    res.status(200).json(exercises);
  } catch (err) {
    next(err);
  }
};

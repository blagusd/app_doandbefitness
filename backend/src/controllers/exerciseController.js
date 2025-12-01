const Exercise = require("../models/Exercise");

exports.createExercise = async (req, res) => {
  try {
    const { name, youtubeLink, muscleGroup } = req.body;
    const exercise = new Exercise({ name, youtubeLink, muscleGroup });
    await exercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    res
      .status(500)
      .json({ message: "✋ Error by adding an exercise", error: err.message });
  }
};

exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (err) {
    res
      .status(500)
      .json({ message: "✋ Cannot catch the exercises", error: err.message });
  }
};

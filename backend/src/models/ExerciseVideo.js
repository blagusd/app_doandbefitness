const mongoose = require("mongoose");

const exerciseVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  category: { type: String, enum: ["abs", "stretching"], required: true },
});

module.exports = mongoose.model("ExerciseVideo", exerciseVideoSchema);

const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  youtubeLink: { type: String },
  muscleGroup: { type: String }, // e.g. "Chest"
  notes: { type: String },
});

module.exports = mongoose.model("Exercise", exerciseSchema);

const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  workouts: [
    {
      day: String, // e.g. Day 01
      exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
    },
  ],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Plan", planSchema);

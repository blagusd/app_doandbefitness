const mongoose = require("mongoose");

const weeklyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekNumber: { type: Number, required: true },

  days: [
    {
      day: { type: String, required: true },
      exercises: [
        {
          exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
          actualSets: Number,
          actualReps: Number,
          actualWeight: Number,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("WeeklyPlan", weeklyPlanSchema);

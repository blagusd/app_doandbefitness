const mongoose = require("mongoose");

const weeklyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  weekNumber: Number,
  days: [
    {
      day: String,
      exercises: [
        {
          exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
          name: String,
          trainerNotes: String,

          plannedSets: Number,
          plannedReps: Number,
          plannedWeight: Number,

          actualSets: Number,
          actualReps: Number,
          actualWeight: Number,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("WeeklyPlan", weeklyPlanSchema);

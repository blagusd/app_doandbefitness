const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "client" },
  createdAt: { type: Date, default: Date.now },
  weeklyPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
  completedWeeks: { type: [Number], default: [] },
  planDays: { type: Number, default: 3 },
  progressEntries: [
    {
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
      sets: Number,
      reps: Number,
      weight: Number,
      date: { type: Date, default: Date.now },
    },
  ],
  weightHistory: [
    {
      date: { type: Date, default: Date.now },
      weight: Number,
    },
  ],
  progressPhotos: {
    front: [String],
    side: [String],
    back: [String],
  },
  stepsHistory: {
    type: [
      {
        date: { type: Date, default: Date.now },
        steps: Number,
      },
    ],
    default: [],
  },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);

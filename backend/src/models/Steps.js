const mongoose = require("mongoose");

const StepsProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  steps: { type: Number, required: true },
});

module.exports = mongoose.model("StepsProgress", StepsProgressSchema);

const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    wind: { type: Number, required: true },
    summary: { type: String, required: true },
    insight: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("location", locationSchema);
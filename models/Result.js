const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    collection: "results",
    autoIndex: false // 👈 Yeh Mongoose ko purane corrupt indexes uthane se rokega
  }
);

module.exports = mongoose.model("Result", ResultSchema);
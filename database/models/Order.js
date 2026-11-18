const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 150
  },
  platform: {
    type: String,
    required: true
  },
  targetUrl: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: ""
  },
  status: {
    type: String,
    enum: [
      "planned",
      "in_progress",
      "completed",
      "cancelled"
    ],
    default: "planned"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);

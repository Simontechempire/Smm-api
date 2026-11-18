const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
    select: false
  },
  active: {
    type: Boolean,
    default: true
  },
  requests: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ApiKey", ApiKeySchema);

const mongoose = require("mongoose");
const config = require("../config");

async function connectDatabase() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected successfully");
}

module.exports = connectDatabase;

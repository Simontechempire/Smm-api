const mongoose = require("mongoose");
const Settings = require("../database/models/Settings");

async function logActivity(action, details = {}) {
  const entry = {
    action,
    details,
    createdAt: new Date().toISOString()
  };

  const existing = await Settings.findOne({
    key: "activity_logs"
  });

  const logs = existing?.value || [];

  logs.unshift(entry);

  await Settings.findOneAndUpdate(
    { key: "activity_logs" },
    {
      value: logs.slice(0, 500),
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return entry;
}

module.exports = logActivity;

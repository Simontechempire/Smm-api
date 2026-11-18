const crypto = require("crypto");
const config = require("../config");

function generateKey() {
  return (
    config.apiKeyPrefix +
    "_" +
    crypto.randomBytes(32).toString("hex")
  );
}

function hashKey(key) {
  return crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
}

module.exports = {
  generateKey,
  hashKey
};

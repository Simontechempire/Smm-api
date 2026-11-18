const ApiKey = require("../database/models/ApiKey");
const { hashKey } = require("../utils/generateKey");

module.exports = async function apiKeyAuth(req, res, next) {
  try {
    const key = req.headers["x-api-key"];

    if (typeof key !== "string" || key.length > 200) {
      return res.status(401).json({
        status: false,
        message: "API key required"
      });
    }

    const record = await ApiKey.findOne({
      keyHash: hashKey(key),
      active: true
    }).select("+keyHash");

    if (!record) {
      return res.status(401).json({
        status: false,
        message: "Invalid or inactive API key"
      });
    }

    record.requests += 1;
    record.lastUsed = new Date();

    await record.save();

    req.apiKey = record;
    next();
  } catch (error) {
    next(error);
  }
};

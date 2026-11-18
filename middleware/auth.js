const crypto = require("crypto");
const config = require("../config");

module.exports = function ownerAuth(req, res, next) {
  const token = req.headers["x-admin-token"];

  if (typeof token !== "string") {
    return res.status(401).json({
      status: false,
      message: "Owner authentication required"
    });
  }

  const a = Buffer.from(token);
  const b = Buffer.from(config.adminToken);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({
      status: false,
      message: "Invalid owner token"
    });
  }

  next();
};

require("dotenv").config();

const required = [
  "MONGO_URI",
  "ADMIN_TOKEN"
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  appName: process.env.APP_NAME || "SIMON SMM",
  ownerName: process.env.OWNER_NAME || "Simon",
  mongoUri: process.env.MONGO_URI,
  adminToken: process.env.ADMIN_TOKEN,
  apiKeyPrefix: process.env.API_KEY_PREFIX || "smm",
  environment: process.env.NODE_ENV || "development"
};

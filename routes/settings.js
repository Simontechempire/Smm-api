const router = require("express").Router();
const auth = require("../middleware/auth");
const Settings = require("../database/models/Settings");

router.use(auth);

router.get("/", async (req, res) => {
  const records = await Settings.find({
    key: { $ne: "activity_logs" }
  });

  const settings = {};

  for (const item of records) {
    settings[item.key] = item.value;
  }

  res.json({
    status: true,
    settings
  });
});

router.put("/", async (req, res) => {
  const allowed = ["appName", "ownerName"];

  for (const key of Object.keys(req.body)) {
    if (!allowed.includes(key)) {
      return res.status(400).json({
        status: false,
        message: `Setting not allowed: ${key}`
      });
    }

    if (
      typeof req.body[key] !== "string" ||
      !req.body[key].trim() ||
      req.body[key].length > 100
    ) {
      return res.status(400).json({
        status: false,
        message: `Invalid value for ${key}`
      });
    }
  }

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        {
          value: req.body[key].trim(),
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }
  }

  res.json({
    status: true,
    message: "Settings saved"
  });
});

module.exports = router;

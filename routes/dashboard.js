const router = require("express").Router();
const ownerAuth = require("../middleware/auth");
const Api = require("../controllers/apiController");
const Settings = require("../database/models/Settings");
const Order = require("../database/models/Order");

router.use(ownerAuth);

router.get("/stats", Api.stats);
router.get("/provider", Api.providerStatus);

router.get("/activity", async (req, res) => {
  const record = await Settings.findOne({
    key: "activity_logs"
  });

  res.json({
    status: true,
    logs: record?.value || []
  });
});

router.get("/recent-orders", async (req, res) => {
  const orders = await Order.find()
    .populate("service", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    status: true,
    orders
  });
});

module.exports = router;

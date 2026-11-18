const router = require("express").Router();

const ownerAuth = require("../middleware/auth");
const apiAuth = require("../middleware/apiKey");
const controller = require("../controllers/apiController");

router.post("/keys", ownerAuth, controller.createKey);
router.get("/keys", ownerAuth, controller.listKeys);
router.delete("/keys/:id", ownerAuth, controller.revokeKey);

// These routes require an actual generated API key.
router.get("/v1/services", apiAuth, controller.publicServices);
router.get("/v1/orders", apiAuth, controller.publicOrders);

module.exports = router;

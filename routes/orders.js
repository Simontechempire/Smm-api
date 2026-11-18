const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/orderController");

router.use(auth);

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id/status", controller.updateStatus);

module.exports = router;

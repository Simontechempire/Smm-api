const manager = require("../services/orderManager");

exports.list = async (req, res) => {
  const orders = await manager.getOrders();

  res.json({
    status: true,
    total: orders.length,
    orders
  });
};

exports.create = async (req, res) => {
  const {
    serviceId,
    title,
    platform,
    targetUrl,
    notes
  } = req.body;

  if (!serviceId || !title || !platform || !targetUrl) {
    return res.status(400).json({
      status: false,
      message: "serviceId, title, platform and targetUrl are required"
    });
  }

  let url;

  try {
    url = new URL(targetUrl);
  } catch {
    return res.status(400).json({
      status: false,
      message: "Invalid target URL"
    });
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    return res.status(400).json({
      status: false,
      message: "Invalid URL protocol"
    });
  }

  const order = await manager.createOrder({
    serviceId,
    title,
    platform,
    targetUrl: url.href,
    notes
  });

  res.status(201).json({
    status: true,
    message: "Campaign order created",
    order
  });
};

exports.updateStatus = async (req, res) => {
  const allowed = [
    "planned",
    "in_progress",
    "completed",
    "cancelled"
  ];

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({
      status: false,
      message: "Invalid status"
    });
  }

  const order = await manager.updateOrder(
    req.params.id,
    req.body.status
  );

  res.json({
    status: true,
    order
  });
};

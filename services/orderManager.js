const crypto = require("crypto");
const Service = require("../database/models/Service");
const Order = require("../database/models/Order");
const logActivity = require("../utils/logger");

async function createOrder(data) {
  const service = await Service.findOne({
    _id: data.serviceId,
    active: true
  });

  if (!service) {
    const error = new Error("Active service not found");
    error.status = 404;
    throw error;
  }

  const order = await Order.create({
    orderId: "SMM-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
    service: service._id,
    title: data.title,
    platform: data.platform,
    targetUrl: data.targetUrl,
    notes: data.notes || "",
    status: "planned"
  });

  await logActivity("ORDER_CREATED", {
    orderId: order.orderId
  });

  return order;
}

async function getOrders() {
  return Order.find()
    .populate("service", "name category platform")
    .sort({ createdAt: -1 });
}

async function updateOrder(id, status) {
  const order = await Order.findOneAndUpdate(
    { orderId: id },
    {
      status,
      updatedAt: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  ).populate("service", "name category");

  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  await logActivity("ORDER_STATUS_UPDATED", {
    orderId: id,
    status
  });

  return order;
}

module.exports = {
  createOrder,
  getOrders,
  updateOrder
};

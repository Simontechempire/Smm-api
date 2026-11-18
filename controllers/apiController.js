const ApiKey = require("../database/models/ApiKey");
const { generateKey, hashKey } = require("../utils/generateKey");
const Service = require("../database/models/Service");
const Order = require("../database/models/Order");
const { getProviderStatus } = require("../services/providerManager");

exports.createKey = async (req, res) => {
  const name = req.body.name;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      status: false,
      message: "Key name is required"
    });
  }

  const key = generateKey();

  await ApiKey.create({
    name: name.trim(),
    keyHash: hashKey(key)
  });

  res.status(201).json({
    status: true,
    message: "API key generated. Save it now; it will not be displayed again.",
    apiKey: key
  });
};

exports.listKeys = async (req, res) => {
  const keys = await ApiKey.find()
    .select("name active requests lastUsed createdAt")
    .sort({ createdAt: -1 });

  res.json({
    status: true,
    keys
  });
};

exports.revokeKey = async (req, res) => {
  const key = await ApiKey.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!key) {
    return res.status(404).json({
      status: false,
      message: "API key not found"
    });
  }

  res.json({
    status: true,
    message: "API key revoked"
  });
};

exports.publicServices = async (req, res) => {
  const services = await Service.find({ active: true });

  res.json({
    status: true,
    total: services.length,
    services
  });
};

exports.publicOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("service", "name category")
    .sort({ createdAt: -1 });

  res.json({
    status: true,
    total: orders.length,
    orders
  });
};

exports.stats = async (req, res) => {
  const [
    services,
    orders,
    keys,
    completed,
    active,
    planned
  ] = await Promise.all([
    Service.countDocuments(),
    Order.countDocuments(),
    ApiKey.countDocuments({ active: true }),
    Order.countDocuments({ status: "completed" }),
    Order.countDocuments({ status: "in_progress" }),
    Order.countDocuments({ status: "planned" })
  ]);

  res.json({
    status: true,
    statistics: {
      services,
      orders,
      activeApiKeys: keys,
      completed,
      inProgress: active,
      planned
    }
  });
};

exports.providerStatus = async (req, res) => {
  res.json({
    status: true,
    provider: await getProviderStatus()
  });
};

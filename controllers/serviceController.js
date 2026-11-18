const manager = require("../services/serviceManager");
const logActivity = require("../utils/logger");

exports.list = async (req, res) => {
  const services = await manager.getServices();

  res.json({
    status: true,
    total: services.length,
    services
  });
};

exports.create = async (req, res) => {
  const { name, category, description, platform } = req.body;

  if (![name, category, description, platform].every(
    value => typeof value === "string" && value.trim()
  )) {
    return res.status(400).json({
      status: false,
      message: "All service fields are required"
    });
  }

  const service = await manager.createService({
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    platform: platform.trim()
  });

  await logActivity("SERVICE_CREATED", {
    serviceId: service.id
  });

  res.status(201).json({
    status: true,
    service
  });
};

exports.update = async (req, res) => {
  const allowed = ["name", "category", "description", "platform", "active"];
  const update = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[key] = req.body[key];
    }
  }

  if (!Object.keys(update).length) {
    return res.status(400).json({
      status: false,
      message: "No valid fields supplied"
    });
  }

  const service = await manager.updateService(
    req.params.id,
    update
  );

  if (!service) {
    return res.status(404).json({
      status: false,
      message: "Service not found"
    });
  }

  res.json({
    status: true,
    service
  });
};

exports.remove = async (req, res) => {
  const service = await manager.deleteService(req.params.id);

  if (!service) {
    return res.status(404).json({
      status: false,
      message: "Service not found"
    });
  }

  res.json({
    status: true,
    message: "Service deleted"
  });
};

const Service = require("../database/models/Service");

async function createService(data) {
  return Service.create({
    name: data.name,
    category: data.category,
    description: data.description,
    platform: data.platform,
    active: true
  });
}

async function getServices(activeOnly = false) {
  const filter = activeOnly ? { active: true } : {};

  return Service.find(filter).sort({ createdAt: -1 });
}

async function updateService(id, data) {
  return Service.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true
    }
  );
}

async function deleteService(id) {
  return Service.findByIdAndDelete(id);
}

module.exports = {
  createService,
  getServices,
  updateService,
  deleteService
};

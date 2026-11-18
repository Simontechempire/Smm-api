/*
 * This private edition does not claim to have a delivery provider.
 * It manages tasks using your own team, content and marketing work.
 *
 * An actual provider integration must implement its real API,
 * authentication, request format and delivery-status callbacks.
 */

async function getProviderStatus() {
  return {
    connected: false,
    mode: "OWN_INFRASTRUCTURE",
    message: "No external provider is configured"
  };
}

async function submitTask(task) {
  if (!task || !task.orderId) {
    throw new Error("A valid campaign task is required");
  }

  return {
    accepted: true,
    orderId: task.orderId,
    mode: "INTERNAL_CAMPAIGN_MANAGEMENT",
    message: "Task recorded for internal campaign management"
  };
}

module.exports = {
  getProviderStatus,
  submitTask
};

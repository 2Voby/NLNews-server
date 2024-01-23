const { Schema, model } = require("mongoose");

const ServiceSchema = new Schema({
  serviceId: { type: Number, default: 1 },
  serviceStatus: { type: String, default: "off" },
});

module.exports = model("Service", ServiceSchema);

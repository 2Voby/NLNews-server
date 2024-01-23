const { Schema, model } = require("mongoose");

const GroupsSchema = new Schema({
  name: { type: String, required: true },
  chatID: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = model("Groups", GroupsSchema);

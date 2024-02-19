const { Schema, model } = require("mongoose");

const BotStateSchema = new Schema({
  chatId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  state: { type: String, default: "SLEEP" },
  stateExp: { type: Date, default: null },
  choosedGroups: { type: Array, default: [] },
  messageText: { type: Object, default: "" },
});

module.exports = model("BotsState", BotStateSchema);

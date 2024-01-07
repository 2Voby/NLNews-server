const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  paymentHistory: {
    queue: { type: Array },
    authorized: { type: Array },
  },
  resetToken: { type: String },
  resetTokenExp: { type: Date },
  usedCertificates: { type: Array },
  moneyTokens: { type: Number },
  userCart: { type: Array },
  userOrders: { type: Array },
});

module.exports = model("User", UserSchema);

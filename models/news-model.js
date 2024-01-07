const { Schema, model } = require("mongoose");

const NewsModel = new Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  image: { type: String, default: null },
  body: { type: String, default: "" },
  author: { type: String, default: "Liceum" },
  date: { type: String },
  category: { type: String },
  messageId: { type: String },
  postLink: { type: String },
});

module.exports = model("News", NewsModel);

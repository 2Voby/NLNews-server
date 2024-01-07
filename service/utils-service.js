const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");

class Utils {
  async comparePosts(oldPosts, newPost) {
    return newPost.filter(
      (newItem) => !oldPosts.some((oldItem) => oldItem.id === newItem.id)
    );
  }

  async saveNewPost(newPost) {
    await newsModel.create({
      id: newPost.id,
      title: newPost.title,
      author: newPost.author,
      date: newPost.date,
      messageId: newPost.messageId,
    });
  }

  async pause(millis = 500) {
    return new Promise((resolve) => {
      setTimeout(resolve, millis);
    });
  }
}

module.exports = new Utils();

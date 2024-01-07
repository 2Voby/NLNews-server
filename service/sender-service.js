const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");

// const { axios } = require("axios");
class SendService {
  async sendNewPost(postContent) {
    const TOKEN = process.env.TG_BOT_TOKEN;
    const CHAT_ID = process.env.TG_CHAT_ID;
    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    let message = ``;
    message += `<b>${postContent.title}</b>\n`;
    message += `Дата публікації: ${postContent.date}\n`;
    message += `Автор: ${postContent.author}\n`;
    message += `<a href="${postContent.postLink}">Переглянути всю інформацію</a>\n`;
    let response = await axios.post(URI_API, {
      chat_id: CHAT_ID,
      parse_mode: "html",
      text: message,
    });
    if (response?.status == 200) {
      postContent.messageId = response?.data?.result?.message_id;
      postContent.senderChat = response?.data?.result?.sender_chat;
    }
    return { postContent, response };
  }
}

module.exports = new SendService();

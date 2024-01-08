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
    message += `\n`;
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
      // this.sendPhotoToTelegram();
    }
    return { postContent, response };
  }

  async sendNewPostWithPhoto(postContent) {
    const TOKEN = process.env.TG_BOT_TOKEN;
    const CHAT_ID = process.env.TG_CHAT_ID;
    const URI_API_SEND_PHOTO = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

    let response = await axios.post(URI_API_SEND_PHOTO, {
      chat_id: CHAT_ID,
      photo: postContent.postImage || "",
      caption:
        `<b>${postContent.title}</b>\n` +
        `\n` +
        `Дата публікації: ${postContent.date}\n` +
        `Автор: ${postContent.author}\n` +
        `<a href="${postContent.postLink}">Переглянути всю інформацію</a>`,
      parse_mode: "html",
    });

    if (response?.status == 200) {
      postContent.messageId = response?.data?.result?.message_id;
      postContent.senderChat = response?.data?.result?.sender_chat;
    }

    return { postContent, response };
  }

  async sendPhotoToTelegram() {
    const TOKEN = process.env.TG_BOT_TOKEN;
    const CHAT_ID = process.env.TG_CHAT_ID;

    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

    // Замените 'URL_ИЗОБРАЖЕНИЯ' на URL вашего изображения
    const imageUrl =
      "https://lyceum.ztu.edu.ua/wp-content/uploads/2024/01/prezentacija-bez-nazvy-1.png";
    try {
      const response = await axios.post(URI_API, {
        chat_id: CHAT_ID,
        photo: imageUrl,
        caption: "Описание изображения (необязательно)",
      });

      if (response.status === 200) {
        console.log("Изображение успешно отправлено в Telegram.");
      } else {
        console.error("Произошла ошибка при отправке изображения в Telegram.");
      }
    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  }
}

module.exports = new SendService();

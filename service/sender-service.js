const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");

// const { axios } = require("axios");
class SendService {
  // async sendTestPost() {
  //   const TOKEN = process.env.TG_BOT_TOKEN;
  //   // const CHAT_ID = process.env.TG_CHAT_ID;
  //   // const CHAT_ID = -4069606119;

  //   // let chat_ids_arr = [-1001904185128, -1002087175979];
  //   let chat_ids_arr = [-1002019569143];

  //   const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  //   let message = `<b>Тестове повідомлення</b>`;

  //   for (const CHAT_ID of chat_ids_arr) {
  //     let response = await axios.post(URI_API, {
  //       // message_thread_id: 33,
  //       chat_id: CHAT_ID,
  //       parse_mode: "html",
  //       text: message,
  //     });
  //   }

  //   // const CHAT_ID = -1001904185128;
  // }

  async sendNewPost(postContent) {
    const TOKEN = process.env.TG_BOT_TOKEN;
    const CHANNEL_CHAT_ID = process.env.TG_CHAT_ID;
    const TEACHERS_CHAT_ID = -1002019569143;
    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    let message = ``;
    message += `<b>${postContent.title}</b>\n`;
    message += `\n`;
    message += `Дата публікації: ${postContent.date}\n`;
    message += `Автор: ${postContent.author}\n`;
    message += `<a href="${postContent.postLink}">Переглянути всю інформацію</a>\n`;

    let chat_ids_arr = [CHANNEL_CHAT_ID, TEACHERS_CHAT_ID]; // prod
    // let chat_ids_arr = [CHANNEL_CHAT_ID]; // dev

    let response;
    for (const CHAT_ID of chat_ids_arr) {
      response = await axios.post(URI_API, {
        chat_id: CHAT_ID,
        parse_mode: "html",
        text: message,
      });
    }

    return { postContent };
  }

  async sendNewPostWithPhoto(postContent) {
    const TOKEN = process.env.TG_BOT_TOKEN;
    const CHANNEL_CHAT_ID = process.env.TG_CHAT_ID;
    const TEACHERS_CHAT_ID = -1002019569143;
    const URI_API_SEND_PHOTO = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

    let chat_ids_arr = [CHANNEL_CHAT_ID, TEACHERS_CHAT_ID]; // prod
    // let chat_ids_arr = [CHANNEL_CHAT_ID]; // dev

    let response;
    for (const CHAT_ID of chat_ids_arr) {
      response = await axios.post(URI_API_SEND_PHOTO, {
        chat_id: CHAT_ID,
        photo: postContent.postImage || "",
        caption:
          `<b>${postContent.title}</b>\n` +
          `\n` +
          `<a href="${postContent.postLink}">Переглянути всю інформацію</a>` +
          `\n\n` +
          `Дата публікації: ${postContent.date}\n` +
          `Автор: ${postContent.author}\n`,
        parse_mode: "html",
      });
    }

    return { postContent };
  }
}

module.exports = new SendService();

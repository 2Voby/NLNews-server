const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");
const cheerio = require("cheerio");
const adminController = require("../controllers/admin-controller");
const adminService = require("./admin-service");

// const { axios } = require("axios");
class SendService {
  async sendNewPost(postContent, from = "site", groupIds = null) {
    const TOKEN = process.env.TG_BOT_TOKEN;

    let groups = await adminService.getAllGroups();

    // activeGroups = groups;
    let activeGroups = groups.filter((group) => {
      return group.isActive == true;
    });

    if (groupIds) {
      let objectGroupIds = [];

      groupIds.forEach((group) => {
        let item = { chatID: group };
        objectGroupIds.push(item);
      });

      activeGroups = objectGroupIds;
    }

    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    let chat_ids_arr = activeGroups; // dev

    for (const CHAT_INFO of chat_ids_arr) {
      let CHAT_ID = CHAT_INFO.chatID;
      if (from == "site") {
        let message = ``;
        message += `<b>${postContent.title}</b>\n`;
        message += `\n`;
        message += `<a href="${postContent.postLink}">Переглянути всю інформацію</a>\n\n`;
        message += `Дата публікації: ${postContent.date}\n`;
        message += `Автор: ${postContent.author}\n`;
        await this.sendSitePostNoImage(URI_API, CHAT_ID, message);
      } else if (from == "schedule") {
        const outputHtml = replaceTags(postContent.text);
        let date = formateDate(postContent.date);
        let message = ``;
        message += `<b>${postContent.title}</b>\n`;
        message += `\n`;
        message += `${outputHtml}\n\n`;
        message += `Дата публікації: ${date}\n`;
        message += `Автор: ${postContent.author}\n`;
        await this.sendSchedulePostNoImage(URI_API, CHAT_ID, message);
      }
    }

    return { postContent };
  }

  async sendNewPostWithPhoto(postContent, from = "site", groupIds = null) {
    const TOKEN = process.env.TG_BOT_TOKEN;
    // const CHANNEL_CHAT_ID = process.env.TG_CHAT_ID;
    let groups = await adminService.getAllGroups();

    // activeGroups = groups;

    let activeGroups = groups.filter((group) => {
      return group.isActive == true;
    });
    if (groupIds) {
      let objectGroupIds = [];

      groupIds.forEach((group) => {
        let item = { chatID: group };
        objectGroupIds.push(item);
      });

      activeGroups = objectGroupIds;
    }

    const URI_API_SEND_PHOTO = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

    let chat_ids_arr = activeGroups; // dev

    for (const CHAT_INFO of chat_ids_arr) {
      let CHAT_ID = CHAT_INFO.chatID;

      if (from == "site") {
        await this.sendSitePostWithImage(
          URI_API_SEND_PHOTO,
          CHAT_ID,
          postContent
        );
      } else if (from == "schedule") {
        await this.sendSchedulePostWithImage(
          URI_API_SEND_PHOTO,
          CHAT_ID,
          postContent
        );
      }
    }

    return { postContent };
  }

  async sendSitePostNoImage(URI_API, CHAT_ID, message) {
    await axios.post(URI_API, {
      chat_id: CHAT_ID,
      parse_mode: "html",
      text: message,
    });
  }
  async sendSchedulePostNoImage(URI_API, CHAT_ID, message) {
    await axios.post(URI_API, {
      chat_id: CHAT_ID,
      parse_mode: "html",
      text: message,
    });
  }

  async sendSitePostWithImage(URI_API_SEND_PHOTO, CHAT_ID, postContent) {
    try {
      await axios.post(URI_API_SEND_PHOTO, {
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
    } catch (error) {
      // console.log(error);
    }
  }

  async sendSchedulePostWithImage(URI_API_SEND_PHOTO, CHAT_ID, postContent) {
    try {
      const outputHtml = replaceTags(postContent.text);
      let date = formateDate(postContent.date);
      await axios.post(URI_API_SEND_PHOTO, {
        chat_id: CHAT_ID,
        photo: postContent.postImage || "",
        caption:
          `<b>${postContent.title}</b>\n` +
          `\n` +
          `${outputHtml}` +
          `\n\n` +
          `Дата публікації: ${date}\n` +
          `Автор: ${postContent.author}\n`,
        parse_mode: "html",
      });
    } catch (error) {
      // console.log(error);
    }
  }
}

function replaceTags(html) {
  const $ = cheerio.load(html);

  $("p").replaceWith(function () {
    return $(this).contents() + "\n";
  });

  $("span").each((index, element) => {
    const spanContent = $(element).text();
    $(element).replaceWith(`<b>${spanContent}</b>`);
  });

  // Замена тегов <em> и <u> на <i> и <b>
  $("em").replaceWith("" + $("em").html() + "");
  $("u").replaceWith("" + $("u").html() + "");

  $("li").replaceWith(function () {
    return $(this).contents();
  });
  $("ul").replaceWith(function () {
    return $(this).contents();
  });

  $("strong").replaceWith("<b>" + $("strong").html() + "</b>");
  $("br").replaceWith("\n");

  return $("body").text();
}

function formateDate(date) {
  if (!date) {
    return null;
  }
  const inputDate = new Date(date);
  const day = inputDate.getDate().toString().padStart(2, "0");
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0"); // Месяцы в JavaScript начинаются с 0
  const year = inputDate.getFullYear();

  const formattedDate = `${day}.${month}.${year}`;
  return formattedDate;
}

module.exports = new SendService();

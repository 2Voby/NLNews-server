const botStateModel = require("../models/bot-state-model");
const groupsModel = require("../models/groups-model");
const serviceModel = require("../models/service-model");

class BotFunc {
  // функції ботів
  async chechAuth(bot, userId, chatId) {
    let user = await botStateModel.findOne({ userId: userId });
    if (!user) {
      this.unautorizeError(bot, chatId);
      return { found: false, user: null };
    }

    return { found: true, user: user };
  }

  validateRequest(bot, chatType, userId) {
    if (chatType != "private") {
      return "error";
    }

    if (userId != 1755769201 && userId != 422617016) {
      return "error";
    }

    return "allowed";
  }

  async validateTextMessage(bot, userId, message) {
    // переглядаємо стейт бота
    let botModel = await botStateModel.findOne({ userId: userId });
    if (!botModel) {
      return this.unautorizeError(bot, chatId);
    }
    let botState = botModel.state;
    // очікування відправки повідомлення
    if (botState == "WAITING_MESSAGE") {
      botModel.state = "WAITING_CHOOSE_GROUP";
      botModel.messageText = message;
      await botModel.save();
      if (message.photo) {
        // Формируем массив объектов с данными о каждом изображении

        const media = message.photo.map((photo, index) => ({
          type: "photo",
          media: photo.file_id,
          caption: index === 0 ? message.text : "", // Устанавливаем текст только для первой фотографии
        }));

        // Отправляем сообщение с массивом изображений и текстом
        await bot.sendMessage(userId, `Ваше повідомлення:`);
        await bot.sendMediaGroup(userId, media);

        // await bot.sendMessage(userId, `Ваше повідомлення:\n\n${message.text}`);
      } else {
        await bot.sendMessage(userId, `Ваше повідомлення:\n\n${message.text}`);
      }
      let groupButtons = await this.createGroupsButtons();
      return bot.sendMessage(userId, "Оберіть чати:", groupButtons);
    }

    // очікування обирання чатів для відправки
    if (botState == "WAITING_CHOOSE_GROUP") {
      botModel.state = "SLEEP";
      botModel.messageText = "";
      await botModel.save();
      return await bot.sendMessage(
        userId,
        `Повідомлення відправлено в: ${message}`
      );
    }

    // якщо текст і стейт невідомий
    return await bot.sendMessage(
      userId,
      `Я вас не розумію. Спробуйде почати спочатку`
    );
  }

  async unautorizeError(bot, chatId) {
    return await bot.sendMessage(
      chatId,
      "Для початку використайте команду /start"
    );
  }

  async createGroupsButtons() {
    let groups = await groupsModel.find();
    let buttons = {
      reply_markup: {
        inline_keyboard: [],
      },
    };

    groups.forEach((groupElement) => {
      buttons.reply_markup.inline_keyboard.push([
        {
          text: `${groupElement.name}`,
          callback_data: JSON.stringify({
            value: `${groupElement.chatID}`,
            type: "CHOOSE_GROUP",
          }),
        },
      ]);
    });
    buttons.reply_markup.inline_keyboard.push([
      {
        text: "Підтвердити",
        callback_data: JSON.stringify({
          value: "SUBMIT",
          type: "CHOOSE_GROUP",
        }),
      },
    ]);
    // [
    // {
    //   text: "11-А",
    //   callback_data: JSON.stringify({
    //     value: "11-А",
    //     type: "CHOOSE_GROUP",
    //   }),
    // },
    //   {
    //     text: "11-Б",
    //     callback_data: JSON.stringify({
    //       value: "11-Б",
    //       type: "CHOOSE_GROUP",
    //     }),
    //   },
    // ],
    // [
    //   {
    //     text: "NLNews",
    //     callback_data: JSON.stringify({
    //       value: "NLNEWS",
    //       type: "CHOOSE_GROUP",
    //     }),
    //   },
    //   {
    //     text: "PRODES",
    //     callback_data: JSON.stringify({
    //       value: "PRODES",
    //       type: "CHOOSE_GROUP",
    //     }),
    //   },
    // ],
    // [
    //   {
    //     text: "Підтвердити",
    //     callback_data: JSON.stringify({
    //       value: "SUBMIT",
    //       type: "CHOOSE_GROUP",
    //     }),
    //   },
    // ],

    return buttons;
  }

  async createReplyButtons(choosedGroups) {
    let groups = await groupsModel.find();
    let reply_markup = {
      inline_keyboard: [],
    };

    groups.forEach((groupElement) => {
      reply_markup.inline_keyboard.push([
        {
          text: `${groupElement.name} ${
            choosedGroups.includes(groupElement.chatID) ? "✅" : ""
          }`,
          callback_data: JSON.stringify({
            value: `${groupElement.chatID}`,
            type: "CHOOSE_GROUP",
          }),
        },
      ]);
    });

    reply_markup.inline_keyboard.push([
      {
        text: "Підтвердити",
        callback_data: JSON.stringify({
          value: "SUBMIT",
          type: "CHOOSE_GROUP",
        }),
      },
    ]);

    return reply_markup;
  }
}

module.exports = new BotFunc();

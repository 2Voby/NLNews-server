const botStateModel = require("../models/bot-state-model");
const serviceModel = require("../models/service-model");
const botFunctionsService = require("./bot-functions-service");
const botFunc = require("./bot-functions-service");
const senderService = require("./sender-service");

class botApiService {
  async listenTelegram(bot) {
    bot.setMyCommands([
      { command: "/start", description: "Початок роботи" },
      {
        command: "/sendtext",
        description: "Введіть текст для відправки у чати",
      },
      { command: "/help", description: "Інформація" },
    ]);
    bot.on("message", async function (msg) {
      const chatId = msg.chat.id;
      const chatType = msg.chat.type;

      let textMessage = {
        text: msg.text,
      };
      const userId = msg.from.id;

      let status = botFunc.validateRequest(bot, chatType, userId);
      if (status != "allowed") {
        return;
      }

      if (textMessage.text === "/start") {
        let user = await botStateModel.findOne({ userId: userId });
        if (!user) {
          await botStateModel.create({
            userId: userId,
            chatId: chatId,
            state: "SLEEP",
          });
          return bot.sendMessage(
            chatId,
            `Ви щойно зареєструвались в базі даних!`
          );
        }
        user.state = "SLEEP";
        user.messageText = "";
        user.choosedGroups = [];

        await user.save();
        return bot.sendMessage(chatId, `Ваш аккаунт вже зареєстровано!`);
      }

      if (textMessage.text === "/sendtext") {
        let authStatus = await botFunc.chechAuth(bot, userId, chatId);
        if (authStatus.found == true) {
          let user = authStatus.user;
          user.state = "WAITING_MESSAGE";
          user.choosedGroups = [];
          await user.save();
          return bot.sendMessage(chatId, `Очікую ваш текст :)`);
        }
      }

      if (textMessage.text === "/help") {
        let user = await botStateModel.findOne({ userId: userId });
        if (user) {
          user.state = "SLEEP";
          user.messageText = "";
          user.choosedGroups = [];
          await user.save();
        }
        return bot.sendMessage(
          chatId,
          `Цей бот використовується для розсилки повідомлень по телеграм чатам Накуового Ліцею.\n\nЯкщо виникли проблеми чи ви хочете стати адміністратором, пишіть @Vobyyy`
        );
      }

      if (msg.entities) {
        if (msg.entities[0].type != "bot_command") {
          return await botFunc.validateTextMessage(bot, userId, textMessage);
        }
      } else if (!msg.entities) {
        if (msg.photo) {
          // let textMessage = msg.photo;
          // textMessage += "\n";
          // textMessage += msg.caption;
          let textMessage = {
            photo: msg.photo,
            text: msg.caption,
          };

          console.log(textMessage);

          return await botFunc.validateTextMessage(bot, userId, textMessage);
        }

        return await botFunc.validateTextMessage(bot, userId, textMessage);
      }

      return;
    });

    bot.on("callback_query", async (query) => {
      const chatId = query.message.chat.id;
      const userId = query.from.id;
      let callbackData = query.data;
      const messageId = query.message.message_id;

      callbackData = JSON.parse(callbackData);
      let callbackValue = callbackData.value;

      let userBot = await botStateModel.findOne({ userId: userId });
      if (!userBot) {
        return bot.sendMessage(
          chatId,
          "Сталась помилка при отримані даних, спробуйде знову"
        );
      }

      // проверка на тип колбека
      if (callbackData.type == "CHOOSE_GROUP") {
        if (callbackData.value == "SUBMIT") {
          userBot.state = "SLEEP";
          let choosedGroups = userBot.choosedGroups;
          let message = userBot.messageText;
          userBot.choosedGroups = [];
          userBot.messageText = "";
          await userBot.save();
          await bot.deleteMessage(chatId, messageId);
          console.log(choosedGroups);
          let sendStatus = await senderService.sendTgMessage(
            message,
            choosedGroups,
            null
          );

          return bot.sendMessage(chatId, "Відправка успішна!");
        } else {
          let choosedGroups = userBot.choosedGroups;

          if (!choosedGroups.includes(callbackValue)) {
            choosedGroups.push(callbackValue);
          } else if (choosedGroups.includes(callbackValue)) {
            let indexOfEl = choosedGroups.indexOf(callbackValue);
            choosedGroups.splice(indexOfEl, 1);
          }
          await userBot.save();

          let replyMarkup = await botFunctionsService.createReplyButtons(
            choosedGroups
          );

          try {
            await bot.editMessageReplyMarkup(replyMarkup, {
              chat_id: chatId,
              message_id: messageId,
            });
          } catch (error) {
            console.log(error);
            return await bot.sendMessage(
              chatId,
              "Сталась помилка, спробуйте ще раз!"
            );
          }
        }
      }
    });
  }
}

module.exports = new botApiService();

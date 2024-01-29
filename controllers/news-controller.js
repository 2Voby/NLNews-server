const serviceModel = require("../models/service-model");
const senderService = require("../service/sender-service");

class NewsControler {
  async createNewPost(req, res, next) {
    try {
      let { id, date, time, title, text, image, pinStatus, idsArray } =
        req.body;
      let postBody = {
        id: id,
        title: title,
        text: text,
        author: "Афіша розкладу",
        date: date,
        postLink: "",
        postImage: null,
      };

      idsArray = JSON.parse(idsArray);

      let service = await serviceModel.findOne({ serviceId: 1 });
      if (service) {
        if (service.serviceStatus == "on") {
          if (postBody.postImage) {
            await senderService.sendNewPostWithPhoto(
              postBody,
              "schedule",
              idsArray
            );
          } else {
            await senderService.sendNewPost(postBody, "schedule", idsArray);
          }
        } else {
          console.log(
            "Сервіс вимкнено! Для активації зайдіть в панель управління"
          );
        }
      } else {
        console.error("Неможливо отримати статус сервісу");
      }

      return res.status(200).json("got the file");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new NewsControler();

const senderService = require("../service/sender-service");

class NewsControler {
  async createNewPost(req, res, next) {
    try {
      let { id, date, time, title, text, image, pinStatus } = req.body;
      let postBody = {
        id: id,
        title: title,
        text: text,
        author: "Афіша розкладу",
        date: date,
        postLink: "",
        postImage: null,
      };
      if (postBody.postImage) {
        await senderService.sendNewPostWithPhoto(postBody, "schedule");
      } else {
        await senderService.sendNewPost(postBody, "schedule");
      }
      return res.status(200).json("got the file");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new NewsControler();

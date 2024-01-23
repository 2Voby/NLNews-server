const senderService = require("../service/sender-service");

class RenderControler {
  async keepServerOnline(req, res, next) {
    return res.status(200).json("sent");
  }
}

// let newPost = {
//   id:
//   title:
//   author:
//   date:
//   postLink:
//   postImage:
// };

module.exports = new RenderControler();

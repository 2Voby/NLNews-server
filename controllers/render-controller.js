class RenderControler {
  async keepServerOnline(req, res, next) {
    try {
      return res.status(200).json("sended");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new RenderControler();

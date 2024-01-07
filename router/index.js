const Router = require("express").Router;
const router = new Router();
const { body } = require("express-validator");
const renderController = require("../controllers/render-controller");

// keep render onlone
router.get("/keep-server-online", renderController.keepServerOnline);

module.exports = router;

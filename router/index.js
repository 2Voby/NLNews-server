const Router = require("express").Router;
const router = new Router();
const { body } = require("express-validator");
const renderController = require("../controllers/render-controller");
const newsController = require("../controllers/news-controller");
const userController = require("../controllers/user-controller");
const adminController = require("../controllers/admin-controller");
const senderService = require("../service/sender-service");
// user
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/refresh", userController.refresh);

// service

router.post("/service-status", adminController.changeServiceStatus);
router.get("/service-status", adminController.getServiceStatus);

// groups
router.get("/groups", adminController.getAllGroups);

router.get("/group:id", adminController.getGroup);

router.post("/group/add", adminController.addNewGroup);
router.post("/group/change-status", adminController.changeGroupStatus);
router.post("/group/delete", adminController.deleteGroup);

// keep render onlone
router.get("/keep-server-online", renderController.keepServerOnline);

router.post("/news/add-from-schedule", newsController.createNewPost);

module.exports = router;

const ApiError = require("../exceptions/api-error");
const serviceModel = require("../models/service-model");
const adminService = require("../service/admin-service");
const senderService = require("../service/sender-service");

class AdminControler {
  async changeServiceStatus(req, res, next) {
    try {
      let { serviceStatus } = req.body;
      if (serviceStatus != "on" && serviceStatus != "off") {
        return next(
          ApiError.BadRequest(
            "Невідомий для встановлення статус сервісу (on/off)"
          )
        );
      }

      let setStatus = await adminService.setServiceStatus(serviceStatus);

      return res.json(setStatus);
    } catch (e) {
      next(e);
    }
  }

  async getServiceStatus(req, res, next) {
    try {
      let service = await serviceModel.findOne({ serviceId: 1 });
      if (!service) {
        return next(
          ApiError.BadRequest(
            "Невідомий для встановлення статус сервісу (on/off)"
          )
        );
      }
      return res.json(service);
    } catch (e) {
      next(e);
    }
  }

  async getGroup(req, res, next) {
    try {
      return res.json("service");
    } catch (e) {
      next(e);
    }
  }
  async getAllGroups(req, res, next) {
    try {
      let allGroups = await adminService.getAllGroups();
      return res.json(allGroups);
    } catch (e) {
      next(e);
    }
  }
  async addNewGroup(req, res, next) {
    try {
      let { name, chatId } = req.body;
      let addStatus = await adminService.addNewGroup(name, chatId);
      return res.json(addStatus);
    } catch (e) {
      next(e);
    }
  }
  async changeGroupStatus(req, res, next) {
    try {
      let { groupId } = req.body;
      let statusResponse = await adminService.changeGroupStatus(groupId);
      return res.json(statusResponse);
    } catch (e) {
      next(e);
    }
  }
  async deleteGroup(req, res, next) {
    try {
      let { groupId } = req.body;
      if (!groupId) {
        return next(
          ApiError.BadRequest(
            "Невідомий для встановлення статус сервісу (on/off)"
          )
        );
      }
      let deleteStatus = await adminService.deleteGroup(groupId);
      return res.json(deleteStatus);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new AdminControler();

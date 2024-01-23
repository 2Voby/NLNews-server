const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");
const serviceModel = require("../models/service-model");
const groupsModel = require("../models/groups-model");

class adminService {
  async setServiceStatus(serviceStatus) {
    let service = await serviceModel.findOne({ serviceId: 1 });
    if (!service) {
      throw ApiError.BadRequest("Не можливо встановити статус");
    }

    service = await serviceModel.updateOne(
      { serviceId: 1 },
      {
        serviceStatus: serviceStatus,
      }
    );
    return serviceStatus;
  }

  async addNewGroup(name, chatId) {
    if (!name || !chatId) {
      throw ApiError.BadRequest("Помилка збереження даних!");
    }

    let newGroup = await groupsModel.create({ name: name, chatID: chatId });
    return newGroup;
  }

  async getAllGroups() {
    let allGroups = await groupsModel.find();
    if (!allGroups) {
      throw ApiError.BadRequest("Помилка отримання даних");
    }

    return allGroups;
  }

  async deleteGroup(groupId) {
    let deletedGroup = await groupsModel.findOneAndDelete({ _id: groupId });
    if (!deletedGroup) {
      throw ApiError.BadRequest("Неможливо видалити запис");
    }
    return deletedGroup;
  }
  async changeGroupStatus(groupId) {
    let group = await groupsModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Таку гурупу не знайдено");
    }

    if (group.isActive == true) {
      group.isActive = false;
    } else if (group.isActive == false) {
      group.isActive = true;
    } else {
      group.isActive = false;
    }

    await group.save();
    return group;
  }
}

module.exports = new adminService();

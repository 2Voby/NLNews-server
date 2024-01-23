const ApiError = require("../exceptions/api-error");
const userModel = require("../models/user-model");
const tokenService = require("../service/token-service");

module.exports = async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(new ApiError(500, "Користувач не авторизований"));
    }
    let userInBase = await userModel.findOne({ _id: userData.id });

    if (!userInBase || !userInBase.roles.includes("ADMIN")) {
      return next(new ApiError(500, "В вас немає права доступу"));
    }
    next();
  } catch (e) {
    return next(new ApiError(500, "В вас немає права доступу"));
  }
};

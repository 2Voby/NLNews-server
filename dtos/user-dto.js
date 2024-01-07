module.exports = class UserDto {
  email;
  id;
  isActivated;
  moneyTokens;
  password;

  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.moneyTokens = model.moneyTokens;
    this.password = model.password;
  }
};

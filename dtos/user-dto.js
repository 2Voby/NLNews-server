module.exports = class UserDto {
  email;
  id;
  password;

  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.password = model.password;
  }
};

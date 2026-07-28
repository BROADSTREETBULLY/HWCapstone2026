const { User } = require("../models");
const bcrypt = require("bcryptjs");

//used at register so two accounts can't share an email
const checkUserExists = async (email) => {
  const user = await User.findOne({ email });
  return !!user;
};

//same idea for usernames
const checkUsernameExists = async (username) => {
  const user = await User.findOne({ username });
  return !!user;
};

//create a new user - the password is hashed by the User model before saving
const registerUserInDB = async (userData) => {
  const userExists = await checkUserExists(userData.email);
  const usernameExists = await checkUsernameExists(userData.username);
  if (userExists) {
    throw new Error("User with this email already exists");
  }
  if (usernameExists) {
    throw new Error("User with this username already exists");
  }
  const user = await new User(userData).save();
  return user;
};

//list all users (admin/testing helper)
const displayUsersInDB = async () => {
  const users = await User.find();
  return users;
};

//verify user login details and return user data if valid
const loginUserInDB = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }
  return user;
};

module.exports = {
  registerUserInDB,
  displayUsersInDB,
  loginUserInDB,
  checkUserExists,
  checkUsernameExists,
};

//create controllers registering users and login
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerUserInDB,
  displayUsersInDB,
  loginUserInDB,
} = require("../services/userServices");

//register user
const registerUser = async (userBody) => {
  if (!userBody || typeof userBody !== "object") {
    throw new Error("Invalid request body: missing user data");
  }

  const { username, firstName, lastName, orgId, email, password } = userBody;

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    username,
    orgId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
  };
  const user = await registerUserInDB(userData);
  return user;
};

//display users
const displayUsers = async () => {
  const users = await displayUsersInDB();
  return users;
};

//login user
const loginUser = async ({ username, password }) => {
  const user = await loginUserInDB(username, password);
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { user, accessToken, refreshToken };
};

module.exports = { registerUser, displayUsers, loginUser };

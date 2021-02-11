const bcrypt = require("bcryptjs");
const User = require("../models").User;
const { userWithoutPassword } = require('../utils/helper');

const createUser = (user) => {
  return new Promise((resolve, reject) => {
    User.create(user)
      .then((user) => {
        resolve(userWithoutPassword(user));
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const fromattedErrors = (errorResponse) => {
  return errorResponse.errors.map((error) => {
    return {
      message: error.message,
      type: error.type,
      path: error.path,
    };
  });
};

const updateUser = (user, updateValues) => {
  return new Promise((resolve, reject) => {
    user.update(updateValues)
      .then((updatedUser) => {
        resolve(userWithoutPassword(updatedUser));
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const authenticate = (username, password) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { username: username } })
      .then((user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
          resolve(user);
        } else {
          reject({ message: "Invalid credentials" });
        }
      })
      .catch((error) => {
        reject({ message: "Unknown error" });
      });
  });
};

module.exports = {
  createUser,
  authenticate,
  updateUser,
};

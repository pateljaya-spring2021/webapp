const bcrypt = require("bcryptjs");
const User = require("../models").User;
const { userWithoutPassword } = require("../utils/helper");

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
    user
      .update(updateValues)
      .then((updatedUser) => {
        resolve(userWithoutPassword(updatedUser));
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const validateUser = (user, method) => {
  const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
  const { password } = user;
  return new Promise((resolve, reject) => {
    if (method == "PUT" && !user.hasOwnProperty("password")) {
      return resolve();
    }

    if (password === undefined || password === null) {
      reject({ message: "password cannot be null" });
    } else {
      if (password.match(passwordRegex)) {
        resolve();
      } else {
        reject({
          message:
            "password must be atleast 8 characters long and must include atleast 1 lower case, 1 upper case, 1 special character and 1 number",
        });
      }
    }
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
  validateUser,
};

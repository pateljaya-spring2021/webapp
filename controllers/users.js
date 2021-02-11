const userService = require("../services/users");
const { userWithoutPassword } = require('../utils/helper');

const createUser = (req, res) => {
  const { first_name, last_name, password, username } = req.body;

  const user = {
    first_name: first_name,
    last_name: last_name,
    password: password,
    username: username,
  };

  userService
    .createUser(user)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((errors) => {
      res.status(400).json(errors);
    });
};

const getUser = (req, res) => {
  res.status(200).json(userWithoutPassword(req.user));
};

const updateUser = (req, res) => {
  const updateAttributes = Object.keys(req.body);

  if(unPermittedUpdateAttributes(updateAttributes)){
    return res.sendStatus(400);
  }

  userService
    .updateUser(req.user, req.body)
    .then(() => {
      return res.sendStatus(204);
    })
    .catch((errors) => {
      res.status(400).json(errors);
    });
};

const unPermittedUpdateAttributes = (updateAttributes) => {
  const permittedAttributes = ['first_name', 'last_name', 'password'];
  return !updateAttributes.every((attribute) => permittedAttributes.includes(attribute));
}

module.exports = {
  createUser,
  getUser,
  updateUser,
};

//dependencies
const userRouter = require("express").Router();

//import service layer
const usersController = require("../controllers/users");

// authentication middleware
const authenticateUser = require("../middleware/userAuthentication");
const validateUser = require("../middleware/userValidation");

/**
 * The following route is used to create a new user
 * @method POST
 * @memberof userRoute
 * @function /v1/user
 * @param {Object} req request
 * @param {Object} res response
 */
userRouter.post("/", validateUser, usersController.createUser);

/**
 * The following route is used to get user information
 * @method POST
 * @memberof userRoute
 * @function /v1/user
 * @param {Object} req request
 * @param {Object} res response
 */
userRouter.get("/self", authenticateUser, usersController.getUser);

/**
 * The following route is used to update a user
 * @method POST
 * @memberof userRoute
 * @function /v1/user
 * @param {Object} req request
 * @param {Object} res response
 */
userRouter.put(
  "/self",
  authenticateUser,
  validateUser,
  usersController.updateUser
);

module.exports = userRouter;

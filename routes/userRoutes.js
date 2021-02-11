//dependencies
const userRouter = require("express").Router();

//import service layer
const usersController = require("../controllers/users");

// authentication middleware
const authenticateUser = require('../middleware/userAuthentication');

/**
 * The following route is used to create a new user
 * @method POST
 * @memberof userRoute
 * @function /v1/user
 * @param {Object} req request
 * @param {Object} res response
 */
userRouter.post("/", usersController.createUser);

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
userRouter.put("/self", authenticateUser, usersController.updateUser);

  
module.exports = userRouter;
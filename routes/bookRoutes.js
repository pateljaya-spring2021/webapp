//dependencies
const bookRouter = require("express").Router();

//import service layer
const booksController = require("../controllers/books");

// authentication middleware
const authenticateUser = require("../middleware/userAuthentication");
const authorizeUser = require("../middleware/authorizeUser");

/**
 * The following route is used to create a book
 * @method POST
 * @memberof bookRoute
 * @function /books
 * @param {Object} req request
 * @param {Object} res response
 */
bookRouter.post(
  "/",
  authenticateUser,
  booksController.createBook
);

/**
 * The following route is used to get book by id
 * @method GET
 * @memberof bookRoute
 * @function /books/:id
 * @param {Object} req request
 * @param {Object} res response
 */
bookRouter.get("/:id", booksController.getBook);

/**
 * The following route is used to delete book by id
 * @method DELETE
 * @memberof bookRoute
 * @function /books/:id
 * @param {Object} req request
 * @param {Object} res response
 */
bookRouter.delete("/:id", authenticateUser, authorizeUser, booksController.deleteBook);

/**
 * The following route is used get all books
 * @method GET
 * @memberof bookRoute
 * @function /books
 * @param {Object} req request
 * @param {Object} res response
 */
bookRouter.get("/", booksController.getAllBooks);

module.exports = bookRouter;

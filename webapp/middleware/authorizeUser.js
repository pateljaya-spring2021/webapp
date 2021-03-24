const Book = require("../models").Book;
const bookService = require("../services/books");
const logger = require('../config/logger');

const authorizeUser = (req, res, next) => {
  logger.info("Entering User Authentication");
  let bookUUID = req.params.id;

  if (req.method == "POST") {
    bookUUID = req.params.book_id;
  }
  const user = req.user;
  bookService
    .getBook(bookUUID)
    .then((book) => {
      book
        .getUser()
        .then((bookUser) => {
          if (bookUser.equals(user)) {
            logger.info("User Authenticated");
            req.book = book;
            next();
          } else {
            logger.error("User is not authenticated to perform this action");
            return res
              .status(401)
              .send({
                message:
                  "Only creater of the book is authorized to perform this action",
              });
          }
        })
        .catch((error) => {
          logger.error(error);
          return res.status(404).send(error);
        });
    })
    .catch((error) => {
      logger.error(error);
      return res.status(404).send(error);
    });
};
module.exports = authorizeUser;

const Book = require("../models").Book;
const bookService = require("../services/books");

const authorizeUser = (req, res, next) => {
  const bookUUID = req.params.id;
  const user = req.user;
  bookService
    .getBook(bookUUID)
    .then((book) => {
      if (user.dataValues.id === book.user_id) {
        req.book = book;
        next();
      } else {
        return res
          .status(401)
          .send({ message: "Only creater of the book can delete book" });
      }
    })
    .catch((error) => {
      return res.status(404).send(error);
    });
};
module.exports = authorizeUser;

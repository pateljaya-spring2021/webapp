const Book = require("../models").Book;
const bookService = require("../services/books");

const authorizeUser = (req, res, next) => {
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
            req.book = book;
            next();
          } else {
            return res
              .status(401)
              .send({
                message:
                  "Only creater of the book is authorized to perform this action",
              });
          }
        })
        .catch((error) => {
          return res.status(404).send(error);
        });
    })
    .catch((error) => {
      return res.status(404).send(error);
    });
};
module.exports = authorizeUser;

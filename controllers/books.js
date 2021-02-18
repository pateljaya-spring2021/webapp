const bookService = require("../services/books");
const { bookWithoutUpdatedDate } = require("../utils/helper");

const createBook = (req, res) => {
  const userId = req.user.id;
  const { title, author, isbn, published_date } = req.body;

  const book = {
    title: title,
    author: author,
    isbn: isbn,
    published_date: published_date,
    user_id: userId,
  };

  bookService
    .createBook(book)
    .then((book) => {
      res.status(201).json(book);
    })
    .catch((errors) => {
      res.status(400).json(errors);
    });
};

const getBook = (req, res) => {
  bookService
    .getBook(req.params.id)
    .then((book) => {
      res.status(200).json(bookWithoutUpdatedDate(book));
    })
    .catch((errors) => {
      res.status(400).json(errors);
    });
};

const deleteBook = (req, res) => {
  bookService
    .deleteBook(req.book)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((errors) => {
      res.status(404).json(errors);
    });
};

const getAllBooks = (req, res) => {
  bookService
    .getBooks(req.params.id)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((errors) => {
      res.status(400).json(errors);
    });
};

module.exports = {
  createBook,
  getBook,
  deleteBook,
  getAllBooks
};

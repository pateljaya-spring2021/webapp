const bcrypt = require("bcryptjs");
const Book = require("../models").Book;
const { bookWithoutUpdatedDate } = require("../utils/helper");

const createBook = (book) => {
  return new Promise((resolve, reject) => {
    Book.create(book)
      .then((book) => {
        resolve(bookWithoutUpdatedDate(book));
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const getBook = (id) => {
  return new Promise((resolve, reject) => {
    Book.findByPk(id)
      .then((book) => {
        if (book) {
          resolve(book);
        } else {
          reject({ message: "No such book found" });
        }
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const deleteBook = (book) => {
  return new Promise((resolve, reject) => {
    book
      .destroy()
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject({ message: "Something went wrong. Unable to delete book" });
      });
  });
};

const getBooks = (id) => {
  return new Promise((resolve, reject) => {
    Book.findAll()
      .then((book) => {
        resolve(book);
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

module.exports = {
  createBook,
  getBook,
  deleteBook,
  getBooks,
};

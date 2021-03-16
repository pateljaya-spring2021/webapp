const bookService = require("../services/books");
const { bookWithoutUpdatedDate } = require("../utils/helper");
const File = require("../models").File;
const { reject } = require("lodash");

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

const addBookImage = async (req, res) => {
  if (!req.file) {
    res.status(400).send({
      message: "No File Uploaded!",
    });
  }

  const book_id = req.book.id;
  const user_id = req.user.id;
  const file_name = req.file.originalname;
  const file_path = req.file.path;

  File.findAll({
    where: { book_id: book_id, file_name: file_name },
  }).then((files) => {
    if (files.length > 0) {
      reject(
        res.status(400).send({
          message: "Duplicate file name not allowed",
        })
      );
    } else {
      if (isValidImage(file_name)) {
        bookService
          .addBookImageToS3(file_path, file_name)
          .then((data) => {
            const removeHttpregex = /(^\w+:|^)\/\//;
            const s3Obj = data.Location.replace(removeHttpregex, "");

            bookService
              .createFile(file_name, s3Obj, user_id, book_id)
              .then((file) => {
                res.status(201).send(file);
              })
              .catch((error) => {
                res.status(400).send(error);
              });
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      } else {
        res.status(400).send({
          message: "Unsupported File Type",
        });
      }
    }
  });
};

const isValidImage = (file_name) => {
  const imageRegex = /\.(gif|jpe?g|png)$/i;
  return imageRegex.test(file_name);
};

const deleteBookImage = (req, res) => {
  File.findByPk(req.params.image_id)
    .then((file) => {
      const s3_Key = file.dataValues.s3_object_name.substring(file.dataValues.s3_object_name.lastIndexOf('/') + 1)
      if (file) {
        bookService
          .deleteBookImageFromS3(s3_Key)
          .then((s3_data) => {
            bookService
              .deleteBookImage(file.dataValues.file_id)
              .then(() => {
                res.sendStatus(204);
              })
              .catch((errors) => {
                res.status(400).json(errors);
              });
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      } else {
        res.status(404).send({ message: "No such image found" });
      }
    })
    .catch((errorResponse) => {
      res.status(404).send({ message: "No such image found" });
    });
};

module.exports = {
  createBook,
  getBook,
  deleteBook,
  getAllBooks,
  addBookImage,
  deleteBookImage,
};

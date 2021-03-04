const bcrypt = require("bcryptjs");
const Book = require("../models").Book;
const File = require("../models").File;
const { bookWithoutUpdatedDate } = require("../utils/helper");
const fs = require("fs");
const AWS = require("aws-sdk");

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
    Book.findByPk(id, { include: { model: File, as: "book_images" } })
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
      .then((book) => {
        book.dataValues.book_images.forEach((file) => {
          deleteBookImageFromS3(file.file_name);
        });
        resolve();
      })
      .catch(() => {
        reject({ message: "Something went wrong. Unable to delete book" });
      });
  });
};

const getBooks = (id) => {
  return new Promise((resolve, reject) => {
    Book.findAll({ include: { model: File, as: "book_images" } })
      .then((book) => {
        resolve(book);
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const addBookImageToS3 = (file_path, file_name) => {
  const s3 = configureS3();
  return new Promise((resolve, reject) => {
    let fileStream = fs.createReadStream(file_path);
    let uploadParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: file_name,
      Body: "",
    };

    uploadParams.Body = fileStream;

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("err", err);
        reject({ error: err });
      }
      if (data) {
        console.log("Upload Success", data);
        resolve(data);
      }
    });
  });
};

const deleteBookImageFromS3 = (file_to_delete) => {
  const s3 = configureS3();
  return new Promise((resolve, reject) => {
    let deleteParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: file_to_delete,
    };

    s3.deleteObject(deleteParams, function (err, data) {
      if (err) {
        console.log("err", err);
        reject({ error: err });
      }
      if (data) {
        console.log("Delete Success", data);
        resolve(data);
      }
    });
  });
};

const deleteBookImage = (file_id) => {
  return new Promise((resolve, reject) => {
    File.destroy({
      where: {
        file_id: file_id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject({ message: "Something went wrong. Unable to delete book" });
      });
  });
};

const configureS3 = () => {
  const s3 = new AWS.S3();
  return s3;
};

const createFile = (file_name, s3_object_name, user_id, book_id) => {
  return new Promise((resolve, reject) => {
    File.create({
      file_name: file_name,
      s3_object_name: s3_object_name,
      user_id: user_id,
      book_id: book_id,
    })
      .then((file) => {
        resolve(file);
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
  addBookImageToS3,
  createFile,
  deleteBookImageFromS3,
  deleteBookImage,
};

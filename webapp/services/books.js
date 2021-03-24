const bcrypt = require("bcryptjs");
const Book = require("../models").Book;
const File = require("../models").File;
const { bookWithoutUpdatedDate } = require("../utils/helper");
const fs = require("fs");
const AWS = require("aws-sdk");
const logger = require('../config/logger');
const SDC = require('statsd-client');
const dbConfig = require("../config/config");

const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});

const createBook = (book) => {
  let start = Date.now();
  logger.info("Querying db for creating book");
  return new Promise((resolve, reject) => {
    Book.create(book)
      .then((book) => {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to create book in db', elapsed);
        resolve(bookWithoutUpdatedDate(book));
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const getBook = (id) => {
  let start = Date.now();
  logger.info("Querying db for getting book by id");
  return new Promise((resolve, reject) => {
    Book.findByPk(id, { include: { model: File, as: "book_images" } })
      .then((book) => {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to find book by id in db', elapsed);
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
  let start = Date.now();
  logger.info("Querying db for deleting book");
  return new Promise((resolve, reject) => {
    book
      .destroy()
      .then((book) => {

        book.dataValues.book_images.forEach((file) => {

          const s3_object_name = file.s3_object_name;

          const s3Key = s3_object_name.substring(s3_object_name.lastIndexOf('/') + 1);

          deleteBookImageFromS3(s3Key);
        });
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to delete book in db', elapsed);
        resolve();
      })
      .catch(() => {
        reject({ message: "Something went wrong. Unable to delete book" });
      });
  });
};

const getBooks = (id) => {
  let start = Date.now();
  logger.info("Querying db for getting all books");
  return new Promise((resolve, reject) => {
    Book.findAll({ include: { model: File, as: "book_images" } })
      .then((book) => {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to get all books from db', elapsed);
        resolve(book);
      })
      .catch((errorResponse) => {
        reject(fromattedErrors(errorResponse));
      });
  });
};

const addBookImageToS3 = (file_path, file_name) => {
  let start = Date.now();
  logger.info(`Creating book image ${file_name} in s3 bucket`);
  const s3 = configureS3();
  return new Promise((resolve, reject) => {
    let fileStream = fs.createReadStream(file_path);
    let uploadParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: new Date().getMilliseconds() + "_" + file_name,
      Body: "",
    };

    uploadParams.Body = fileStream;

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("err", err);
        reject({ error: err });
      }
      if (data) {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing(`time taken to create book image ${uploadParams.Key} in s3`, elapsed);
        console.log("Upload Success", data);
        resolve(data);
      }
    });
  });
};

const deleteBookImageFromS3 = (file_to_delete) => {
  let start = Date.now();
  logger.info(`Deleting book image ${file_to_delete} from s3 bucket`);
  const s3 = configureS3();
  return new Promise((resolve, reject) => {
    let deleteParams = {
      Bucket: process.env.AWS_BUCKET,
      Key:file_to_delete,
    };

    s3.deleteObject(deleteParams, function (err, data) {
      if (err) {
        console.log("err", err);
        reject({ error: err });
      }
      if (data) {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing(`time taken to delete book image ${deleteParams.Key} from s3`, elapsed);
        console.log("Delete Success", data);
        resolve(data);
      }
    });
  });
};

const deleteBookImage = (file_id) => {
  let start = Date.now();
  logger.info("Querying db for deleting book Image");
  return new Promise((resolve, reject) => {
    File.destroy({
      where: {
        file_id: file_id,
      },
    })
      .then(() => {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to delete book image from db', elapsed);
        resolve();
      })
      .catch(() => {
        reject({ message: "Something went wrong. Unable to delete" });
      });
  });
};

const configureS3 = () => {
  const s3 = new AWS.S3();
  return s3;
};

const createFile = (file_name, s3_object_name, user_id, book_id) => {
  let start = Date.now();
  logger.info("Querying db for creating book Image");
  return new Promise((resolve, reject) => {
    File.create({
      file_name: file_name,
      s3_object_name: s3_object_name,
      user_id: user_id,
      book_id: book_id,
    })
      .then((file) => {
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken to create book image in db', elapsed);
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

const bookService = require("../services/books");
const { bookWithoutUpdatedDate } = require("../utils/helper");
const File = require("../models").File;
const { reject } = require("lodash");
const logger = require("../config/logger");
const SDC = require("statsd-client");
const dbConfig = require("../config/config");
const AWS = require("aws-sdk");
require("dotenv").config();

const sdc = new SDC({
  host: dbConfig.METRICS_HOSTNAME,
  port: dbConfig.METRICS_PORT,
});

AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });

const createBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering create book endpoint");
  sdc.increment("No of times post/create book endpoint called");
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
      logger.info("New book created");

      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for post/create book endpoint", elapsed);

      let body_message =
        "Please click here to view the details of the book:  http://prod.jayashreepatel.me/books/" +
        book.id;

      console.log("1");

      const data = {
        ToAddresses: req.user.username,
        bookId: book.id,
        subject: "New book created",
        email_body: body_message,
        type: "POST",
      };

      console.log("2");
      const params = {
        Message: JSON.stringify(data),
        TopicArn: process.env.AWS_SNS_ARN,
      };

      let publishTextPromise = SNS.publish(params).promise();

      publishTextPromise
        .then(function (data) {
          console.log(`Message sent to the topic ${params.TopicArn}`);
          console.log("MessageID is " + data.MessageId);
          res.status(201).json(book);
          logger.info("Book has been created..!");
        })
        .catch(function (err) {
          console.error(err, err.stack);
          res.status(500).send(err);
        });
    })
    .catch((errors) => {
      logger.error(errors);
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for post/create book endpoint", elapsed);
      res.status(400).json(errors);
    });
};

const getBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering get book by id endpoint");
  sdc.increment("No of times get book by id endpoint called");
  bookService
    .getBook(req.params.id)
    .then((book) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for get book by id endpoint", elapsed);
      res.status(200).json(bookWithoutUpdatedDate(book));
    })
    .catch((errors) => {
      logger.error(errors);
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for get book by id endpoint", elapsed);
      res.status(400).json(errors.message);
    });
};

const deleteBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering delete book endpoint");
  sdc.increment("No of times delete book endpoint called");
  bookService
    .deleteBook(req.book)
    .then(() => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for delete book endpoint", elapsed);
      
      let body_message = `Book with id ${book.id} is deleted.`     

      const data = {
        ToAddresses: req.user.username,
        bookId: book.id,
        subject: "Book deleted",
        email_body: body_message,
        type: "DELETE"
      };

      console.log("2");
      const params = {
        Message: JSON.stringify(data),
        TopicArn: process.env.AWS_SNS_ARN,
      };

      let publishTextPromise = SNS.publish(params).promise();

      publishTextPromise
        .then(function (data) {
          console.log(`Message sent to the topic ${params.TopicArn}`);
          console.log("MessageID is " + data.MessageId);
          res.sendStatus(204);
          logger.info("Book has been deleted..!");
        })
        .catch(function (err) {
          console.error(err, err.stack);
          res.status(500).send(err);
        });

     
    })
    .catch((errors) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for delete book endpoint", elapsed);
      logger.error(errors[0].message);
      res.status(404).json(errors);
    });
};

const getAllBooks = (req, res) => {
  let start = Date.now();
  logger.info("Entering get all books endpoint");
  sdc.increment("No of times get all books endpoint called");
  bookService
    .getBooks(req.params.id)
    .then((book) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for get all books endpoint", elapsed);
      res.status(200).json(book);
    })
    .catch((errors) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for get all books endpoint", elapsed);
      logger.error(errors[0].message);
      res.status(400).json(errors);
    });
};

const addBookImage = async (req, res) => {
  let start = Date.now();
  logger.info("Entering add book image endpoint");
  sdc.increment("No of times add book image endpoint called");
  if (!req.file) {
    logger.error("No File Uploaded!");
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
      logger.error("Duplicate file name not allowed");
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for add book image endpoint", elapsed);
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
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing("time taken for add book image endpoint", elapsed);
                res.status(201).send(file);
              })
              .catch((error) => {
                logger.error(error);
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing("time taken for add book image endpoint", elapsed);
                res.status(400).send(error);
              });
          })
          .catch((error) => {
            logger.error(errors[0].message);
            let end = Date.now();
            var elapsed = end - start;
            sdc.timing("time taken for add book image endpoint", elapsed);
            res.status(400).send(error);
          });
      } else {
        logger.error("Unsupported File Type");
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing("time taken for add book image endpoint", elapsed);
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
  let start = Date.now();
  logger.info("Entering delete book image endpoint");
  sdc.increment("No of times delete book image endpoint called");

  File.findByPk(req.params.image_id)
    .then((file) => {
      const s3_Key = file.dataValues.s3_object_name.substring(
        file.dataValues.s3_object_name.lastIndexOf("/") + 1
      );
      if (file) {
        bookService
          .deleteBookImageFromS3(s3_Key)
          .then((s3_data) => {
            bookService
              .deleteBookImage(file.dataValues.file_id)
              .then(() => {
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing(
                  "time taken for delete book image endpoint",
                  elapsed
                );
                res.sendStatus(204);
              })
              .catch((errors) => {
                logger.error(errors);
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing(
                  "time taken for delete book image endpoint",
                  elapsed
                );
                res.status(400).json(errors);
              });
          })
          .catch((error) => {
            logger.error(errors);
            let end = Date.now();
            var elapsed = end - start;
            sdc.timing("time taken for delete book image endpoint", elapsed);
            res.status(400).send(error);
          });
      } else {
        logger.error("No such image found");
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing("time taken for delete book image endpoint", elapsed);
        res.status(404).send({ message: "No such image found" });
      }
    })
    .catch((errorResponse) => {
      logger.error("No such image found");
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing("time taken for delete book image endpoint", elapsed);
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

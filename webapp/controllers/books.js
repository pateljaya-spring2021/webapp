const bookService = require("../services/books");
const { bookWithoutUpdatedDate } = require("../utils/helper");
const File = require("../models").File;
const { reject } = require("lodash");
const logger = require('../config/logger');
const SDC = require('statsd-client');
const dbConfig = require("../config/config");
const AWS= require('aws-sdk');

const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});

const createBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering create book endpoint");
  sdc.increment('No of times post/create book endpoint called');
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

      const book_url=`${req.protocol}://${req.hostname}/books/${book.id}`
    
      logger.info(`book URL: ${book_url}`);
      
      let params={
        MessageStructure:"json",
        Message:JSON.stringify({
            "default":JSON.stringify({
                "book_owner_name":req.user.first_name + " " + req.user.last_name,
                "book_id": book.id,
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "published_date": book.published_date,
                "user_id": book.user_id,
                "book_created": book.book_created,
            })
        }),
        TopicArn:process.env.sns_topic 
    }
    var publish= new AWS.SNS().publish(params).promise();
    const data= await publish;
    console.log(data);
    logger.info(`Published message: ${data.MessageId} to topic`);
    
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for post/create book endpoint', elapsed);
      res.status(201).json(book);
    })
    .catch((errors) => {
      logger.error(errors[0].message);  
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for post/create book endpoint', elapsed);
      res.status(400).json(errors);
    });
};

const getBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering get book by id endpoint");
  sdc.increment('No of times get book by id endpoint called');
  bookService
    .getBook(req.params.id)
    .then((book) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for get book by id endpoint', elapsed);
      res.status(200).json(bookWithoutUpdatedDate(book));
    })
    .catch((errors) => {
      logger.error(errors); 
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for get book by id endpoint', elapsed); 
      res.status(400).json(errors.message);
    });
};

const deleteBook = (req, res) => {
  let start = Date.now();
  logger.info("Entering delete book endpoint");
  sdc.increment('No of times delete book endpoint called');
  bookService
    .deleteBook(req.book)
    .then(() => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for delete book endpoint', elapsed);
      res.sendStatus(204);
    })
    .catch((errors) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for delete book endpoint', elapsed);
      logger.error(errors[0].message);  
      res.status(404).json(errors);
    });
};

const getAllBooks = (req, res) => {
  let start = Date.now();
  logger.info("Entering get all books endpoint");
  sdc.increment('No of times get all books endpoint called');
  bookService
    .getBooks(req.params.id)
    .then((book) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for get all books endpoint', elapsed);
      res.status(200).json(book);
    })
    .catch((errors) => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for get all books endpoint', elapsed);
      logger.error(errors[0].message);  
      res.status(400).json(errors);
    });
};

const addBookImage = async (req, res) => {
  let start = Date.now();
  logger.info("Entering add book image endpoint");
  sdc.increment('No of times add book image endpoint called');
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
      sdc.timing('time taken for add book image endpoint', elapsed);
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
                sdc.timing('time taken for add book image endpoint', elapsed);
                res.status(201).send(file);
              })
              .catch((error) => {
                logger.error(error);
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing('time taken for add book image endpoint', elapsed);
                res.status(400).send(error);
              });
          })
          .catch((error) => {
            logger.error(errors[0].message);  
            let end = Date.now();
            var elapsed = end - start;
            sdc.timing('time taken for add book image endpoint', elapsed);
            res.status(400).send(error);
          });
      } else {
        logger.error("Unsupported File Type");  
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken for add book image endpoint', elapsed);
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
  sdc.increment('No of times delete book image endpoint called');

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
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing('time taken for delete book image endpoint', elapsed);
                res.sendStatus(204);
              })
              .catch((errors) => {
                logger.error(errors);  
                let end = Date.now();
                var elapsed = end - start;
                sdc.timing('time taken for delete book image endpoint', elapsed);
                res.status(400).json(errors);
              });
          })
          .catch((error) => {
            logger.error(errors);  
            let end = Date.now();
            var elapsed = end - start;
            sdc.timing('time taken for delete book image endpoint', elapsed);
            res.status(400).send(error);
          });
      } else {
        logger.error("No such image found");  
        let end = Date.now();
        var elapsed = end - start;
        sdc.timing('time taken for delete book image endpoint', elapsed);
        res.status(404).send({ message: "No such image found" });
      }
    })
    .catch((errorResponse) => {
      logger.error("No such image found");  
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for delete book image endpoint', elapsed);
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

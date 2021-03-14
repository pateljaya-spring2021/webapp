"use strict";
const { v4: uuid } = require("uuid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Book title cannot be empty",
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "author cannot be empty",
          },
        },
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "ISBN cannot be empty",
          },
        },
      },
      published_date: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Published date cannot be empty",
          },
        },
      },
      user_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Book",
      timestamps: true,
      createdAt: "book_created",
      updatedAt: "book_updated",
      hooks: {
        beforeCreate: (book) => {
          book.id = uuid();
        },
      },
    }
  );

  Book.associate = (models) => {
    Book.belongsTo(models.User, { foreignKey: "user_id" });
    Book.hasMany(models.File, {
      as: "book_images",
      foreignKey: "book_id",
      onDelete: "cascade",
    });
  };

  Book.sync({ alter: true });
  return Book;
};

"use strict";
const { v4: uuid } = require("uuid");
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[a-zA-Z\s]+$/,
            msg: "Invalid First Name, only characters are allowed",
          },
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[a-zA-Z\s]+$/,
            msg: "Invalid Last Name, only characters are allowed",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        set(password) {
          const salt = bcrypt.genSaltSync(10);
          this.setDataValue("password", bcrypt.hashSync(password, salt));
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        isUnique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "invalid username/email",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
      createdAt: "account_created",
      updatedAt: "account_updated",
      indexes: [
        {
          unique: true,
          fields: ["username"],
        },
      ],
      hooks: {
        beforeCreate: (user) => {
          user.id = uuid();
        },
      },
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Book, { foreignKey: "user_id" });
    User.hasMany(models.File, { foreignKey: "user_id" });
  };

  User.sync({ alter: true });
  return User;
};

"use strict";
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
          len: {
            args: [1, 100],
            msg: "first name cannot be empty",
          },
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "last name cannot be empty",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        validate: {
          is: {
            args: /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/,
            msg:
              "password must be atleast 8 characters long and must include atleast 1 lower case, 1 upper case, 1 special character and 1 number",
          },
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
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        },
        beforeUpdate: (user) => {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
    }
  );
  User.sync({ alter: true });
  return User;
};

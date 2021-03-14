"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Files", {
      file_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      file_name: {
        type: Sequelize.STRING,
      },
      s3_object_name: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.UUID,
      },
      book_id: {
        type: Sequelize.UUID,
      },
      created_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Files");
  },
};

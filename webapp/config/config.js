require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: 'Amazon RDS',
      rejectUnauthorized: true,
    },
  },
  test: {
    username: 'root',
    password: 'root1234',
    database: 'cloud_webapp',
    host: '127.0.0.1',
    port: 3306,
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  METRICS_HOSTNAME: "localhost",
  METRICS_PORT: 8125
};

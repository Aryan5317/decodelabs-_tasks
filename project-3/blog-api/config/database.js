const { Sequelize } = require('sequelize');
const path = require('path');

// Using SQLite - a file-based database, so no separate DB server needed.
// To switch to Postgres later: change dialect to 'postgres' and pass host/user/password.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // set to console.log if you want to see raw SQL queries
});

module.exports = sequelize;

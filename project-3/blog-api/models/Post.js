const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 150],
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // userId foreign key is added automatically via the association in models/index.js
});

module.exports = Post;

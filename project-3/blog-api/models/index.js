const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');

// A User has many Posts; a Post belongs to one User.
// This creates a `userId` foreign key column on the Posts table.
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Post };

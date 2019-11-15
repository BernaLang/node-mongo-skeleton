/**
* DB models.
*/
'use strict';
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	name: { type: String, trim: true },
	age: { type: Number, min: 0 },
	gender: String
})

var UserModel = mongoose.model('users', userSchema);

module.exports = {
  UserModel
};

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, trim: true },
	name: { type: String, trim: true },
	age: { type: Number, min: 0 },
  gender: { type: String, enum: ["male", "female"], lowercase: true },
  _deleted: { type: Boolean, default: false }
})

let User = mongoose.model('users', userSchema);

module.exports = {
	userModel: User
}
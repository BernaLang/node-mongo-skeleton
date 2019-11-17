/**
* Users services.
*/
'use strict';

let { User } = require('../models');

const USERS_PER_PAGE = 2;

async function getUserById(userId){
	try {
		let user = await User.findOne({ _id: userId }, { _deleted: 0 }).exec();
		return user
	} catch (error) {
		if(error && error.name === "CastError" && error.kind === "ObjectId" && error.path === '_id'){
			throw new Error('invalid-userId');
		} else{
			throw error;
		}
	}
}

function checkUsername(username, ignoreId){
	// If ignoreId var is provided then it will ignore that specific doc in the validation (used for update queries)
	let query = (!ignoreId) ? 
		{ username, _delete: false }
		: { username, _delete: false, _id: { $ne: ignoreId } }
	return User.findOne(query).exec();
}

function queryUsers(query, sort, page){
	let skip, limit;
	if(page && typeof(page) === "number" && page > 0){
		skip = (page - 1) * USERS_PER_PAGE;
		limit = USERS_PER_PAGE;
	} else {
		page = 0
		skip = 0;
		limit = 0;
	}

	// Hides the _deleted field UNLESS it's present on query
	let fields = (!query || query._deleted === undefined) ?
	{ _deleted: 0 }
	: null;

	// Queries for documents that are not deleted UNLESS _delete field is present
	query = { _deleted: false, ...query };

	return User.find(query, fields, { sort: sort, limit: limit, skip: skip }).exec();
}

async function countUsers(query, page){
	let totalDocs = await User.countDocuments(query).exec();
	
	// Caculates totalPages. If there is no page provided then totalPages = 1 UNLESS totalDocs === 0
	let totalPages = ( page && typeof page === "number" && page > 0 ) ? 
		Math.round(totalDocs / USERS_PER_PAGE)
		: ( totalDocs === 0 ) ?
			0
			: 1;
	return { totalDocs, totalPages };
}

function addUser(user) {
	let newUser = new User(user);
	return newUser.save();
}

async function validateUser(user){
	try {
		let newUser = new User(user);
		await newUser.validate();
		return { valid: true };
	} catch (error) {
		return { valid: false, info: error };
	}
}

function updateUser(userInfo, userId){
	delete userInfo._id;
	return User.findOneAndUpdate({ _id: userId }, { $set: userInfo }, { new: true, fields: { _deleted: 0 } });
}

module.exports = {
	checkUsername,
	queryUsers,
	countUsers,
	addUser,
	validateUser,
	getUserById,
	updateUser
};

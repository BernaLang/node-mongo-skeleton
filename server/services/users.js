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

function checkUsername(username){
	return User.findOne({ username: username, _deleted: false }).exec();
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

	let fields = (!query || query._deleted === undefined) ?
	{ _deleted: 0 }
	: null;

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

module.exports = {
	checkUsername,
	queryUsers,
	countUsers,
	addUser,
	validateUser,
	getUserById
};

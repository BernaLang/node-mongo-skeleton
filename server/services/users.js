/**
* Users services.
*/
'use strict';

let { User } = require('../models');

const USERS_PER_PAGE = 2;

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
	return User.find(query, null, { sort: sort, limit: limit, skip: skip }).exec();
}

async function countUsers(query, page){
	let totalDocs = await User.countDocuments(query).exec();
	
	let totalPages = (page && typeof(page) === "number" && page > 0) ? 
		Math.round(totalDocs / USERS_PER_PAGE)
		: 1;
	return { totalDocs, totalPages };
}

module.exports = {
	queryUsers,
	countUsers
};

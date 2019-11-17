/**
* Controllers.
*/
'use strict';

let { 
	queryUsers, 
	addUser, 
	checkUsername, 
	validateUser, 
	countUsers, 
	getUserById,
	updateUser: updateUserService
} = require('../services/users');

async function getUser(userId){
	if(!userId){
		return { ok: false, error: { msg: 'invalid-userId' } };
	} 
	try {
		let getUser = await getUserById(userId);
		return { ok: true, user: getUser };
	} catch (error) {
		if(error && error.name === "CastError" && error.kind === "ObjectId" && error.path === '_id'){
			return { ok: false, error: { msg: 'invalid-userId' } };
		} else {
			throw error;
		}
	}
}

async function getUsers(params = {}){
	if(!params) params = {};

	let sort = {};
	if(params.sort_by && params.order_by){
		sort[params.sort_by] = params.order_by;
	}
	delete params.sort_by;
	delete params.order_by;

	let page = 0;
	if( params.page ){
		page = Number(params.page);
	}
	delete params.page;


	let users = await queryUsers(params, sort, page);
	let counts = await countUsers(params, page);
	return { ...counts, users };
}

async function createUser(userInfo){

	let validUser = await validateUser(userInfo);
	if(validUser.valid !== true){
		return { ok: false, error: { msg: 'invalid-user', info: validUser.info } };
	}

	let usernameExists = await checkUsername(userInfo.username);
	if(usernameExists !== null){
		return { ok: false, error: { msg: 'username-exists' } };
	}

	let newUser = await addUser(userInfo);
	return { ok: true, info: newUser };
}

async function updateUser(userInfo, userId){

	let foundUser = await getUser(userId);
	if(foundUser.ok !== true){
		return { ok: false, error: foundUser.error };
	}
	
	if(!foundUser.user){
		return { ok: false, error: { msg: 'user-not-found' } };
	}

	userInfo._id = userId;
	let validUser = await validateUser(userInfo);
	if(validUser.valid !== true){
		return { ok: false, error: { msg: 'invalid-user', info: validUser.info } };
	}

	let usernameExists = await checkUsername(userInfo.username, userId);
	if(usernameExists !== null && usernameExists._id !== userInfo._id){
		return { ok: false, error: { msg: 'username-exists' } };
	}

	let updatedUser = await updateUserService(userInfo, userId);
	return { ok: true, info: updatedUser };
}

async function deleteUser(userId){

	let foundUser = await getUser(userId);
	if(foundUser.ok !== true){
		return { ok: false, error: foundUser.error };
	}
	
	if(!foundUser.user){
		return { ok: false, error: { msg: 'user-not-found' } };
	}

	let deletedUser = await updateUserService({ _deleted: true }, userId);
	return { ok: true, info: deletedUser };
}

module.exports = {
	getUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser
};

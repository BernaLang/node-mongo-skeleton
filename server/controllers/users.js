/**
* Controllers.
*/
'use strict';

let { queryUsers, addUser, checkUsername, validateUser, countUsers } = require('../services/users');

async function getUsers(params = {}){
	if(!params) params = {};

	let sort = {}
	if(params.sort_by && params.order_by){
		sort[params.sort_by] = params.order_by;
	}
	delete params.sort_by
	delete params.order_by

	let page = 0;
	if( params.page ){
		page = Number(params.page);
	}
	delete params.page


	let users = await queryUsers(params, sort, page);
	let counts = await countUsers(params, page);
	return { ...counts, users };
}

async function createUser(userInfo){

	let validUser = await validateUser(userInfo);
	if(validUser.valid !== true){
		return { ok: false, error: { msg: 'invalid-user', info: validUser.info } }
	}

	let usernameExists = await checkUsername(userInfo.username);
	if(usernameExists !== null){
		return { ok: false, error: { msg: 'username-exists' } };
	}

	let newUser = await addUser(userInfo);
	return { ok: true, info: newUser }
}

module.exports = {
	getUsers,
	createUser
};

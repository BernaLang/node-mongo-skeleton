/**
* Controllers.
*/
'use strict';

let { queryUsers, countUsers } = require('../services/users');

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

module.exports = {
	getUsers
};

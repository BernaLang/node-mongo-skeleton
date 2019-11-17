/**
* User routes definitions.
*/
'use strict';
let express = require('express');
let { getUsers, createUser } = require('../controllers/users');
let moment = require('moment');

let router = express.Router();

router.get('/', async function(req, res) {
	try {
		let params = req.query;
		let users = await getUsers(params);
		return res.json({ ok: true, timestamp: moment.utc().toDate(), ...users });
	} catch (error) {
		console.log('Unexpected error -> ', error);
		return res.status(500).json({ ok: false, err: error, timestamp: moment.utc().toDate() });
	}
});

router.post('/', async function(req, res) {
	try {
		let newUser = req.body;
		let createdUser = await createUser(newUser);
		if(createdUser.ok !== true){
			res.status(400).json({ ok: false, timestamp: moment.utc().toDate(), err: createdUser.error })
		} else {
			return res.json({ ok: true, timestamp: moment.utc().toDate(), createdUser: createdUser.info });
		}
	} catch (error) {
		console.log('Unexpected error -> ', error);
		return res.status(500).json({ ok: false, err: error, timestamp: moment.utc().toDate() });
	}
});

router.get('/:userId', function(req, res) {
	return res.json({ message: 'get user by id' });
});

module.exports = router;
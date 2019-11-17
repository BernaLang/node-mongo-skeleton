/**
* User routes definitions.
*/
'use strict';
let express = require('express');
let { getUsers, createUser, getUser, updateUser } = require('../controllers/users');
let moment = require('moment');
let _get = require('lodash/get')

let router = express.Router();

router.get('/', async function(req, res) {
	try {
		let params = req.query;
		let users = await getUsers(params);
		return res.json({ ok: true, timestamp: moment.utc().toDate(), ...users });
	} catch (error) {
		console.log('Unexpected error -> ', error);
		return res.status(500).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
	}
});

router.post('/', async function(req, res) {
	try {
		let newUser = req.body;
		let createdUser = await createUser(newUser);
		if(createdUser.ok !== true){
			return res.status(400).json({ ok: false, timestamp: moment.utc().toDate(), err: createdUser.error })
		} else {
			return res.json({ ok: true, timestamp: moment.utc().toDate(), createdUser: createdUser.info });
		}
	} catch (error) {
		console.log('Unexpected error -> ', error);
		return res.status(500).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
	}
});

router.get('/:userId', async function(req, res) {
	try {
		let userId = _get(req, 'params.userId', null);

		let foundUser = await getUser(userId);
		if(foundUser.ok !== true){
			return res.status(400).json({ ok: false, timestamp: moment.utc().toDate(), err: foundUser.error })
		} else {
			if(!foundUser.user){
				return res.status(404).json({ ok: true, timestamp: moment.utc().toDate(), msg: 'user-not-found' });
			} else {
				return res.status(200).json({ ok: true, timestamp: moment.utc().toDate(), user: foundUser.user });
			}
		}

	} catch (error) {
		if(error.message === "invalid-userId"){
			return res.status(400).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
		} else {
			console.log('Unexpected error -> ', error);
			return res.status(500).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
		}
	}
});

router.put('/:userId', async function(req, res) {
	try {
		let userId = _get(req, 'params.userId', null);

		let foundUser = await getUser(userId);
		if(foundUser.ok !== true){
			return res.status(400).json({ ok: false, timestamp: moment.utc().toDate(), err: foundUser.error })
		}
		
		if(!foundUser.user){
			return res.status(404).json({ ok: true, timestamp: moment.utc().toDate(), msg: 'user-not-found' });
		}

		let newUserInf = req.body;
		let updatedUser = await updateUser(newUserInf, userId);
		if(updatedUser.ok !== true){
			return res.status(400).json({ ok: false, timestamp: moment.utc().toDate(), err: updatedUser.error })
		} else {
			return res.status(200).json({ ok: true, timestamp: moment.utc().toDate(), user: updatedUser.info });
		}

	} catch (error) {
		if(error.message === "invalid-userId"){
			return res.status(400).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
		} else {
			console.log('Unexpected error -> ', error);
			return res.status(500).json({ ok: false, err: error.message, timestamp: moment.utc().toDate() });
		}
	}
});

module.exports = router;
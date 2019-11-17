/**
* User routes definitions.
*/
'use strict';
let express = require('express');
let { getUsers } = require('../controllers/users');
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

module.exports = router;
/**
* App routes definitions.
*/
'use strict';

const express = require('express');
let router = express.Router();
const usersRoutes = require('./users');

// Welcome message
router.get('/', function(req, res) { return res.json({ message: 'Welcome to our API!' }); });

// Endpoints
router.use('/users', usersRoutes);

module.exports = router;

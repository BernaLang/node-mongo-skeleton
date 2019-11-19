/**
* Setup MongoDB.
*/
'use strict';

let mongoose = require('mongoose');
const DATABASE_URL = (process.env.NODE_ENV === 'test')
	? 'mongodb://localhost:27017/AirportAI_test'
	: 'mongodb://localhost:27017/AirportAI';

/**
* Sets up MongoDB connection.
*/
function setup() {
	
	//TODO: Better way to prevent database logs from showing in testing

  mongoose.connection.on('connected', function () {
		if(process.env.NODE_ENV !== 'test') 
			console.log('MongoDB connected to database.');
  });
  mongoose.connection.on('open', function () {
		if(process.env.NODE_ENV !== 'test') 
    	console.log('MongoDB connection opened!');
  });
  mongoose.connection.on('error', function () {
		if(process.env.NODE_ENV !== 'test') 
    	console.error('MongoDB connection error! Disconnecting...');
    mongoose.disconnect();
  });
  mongoose.connection.on('disconnected', function () {
		if(process.env.NODE_ENV !== 'test') 
    	console.error('MongoDB disconnected! Attempting to reconnect...');
    connectToDb();
  });
  mongoose.connection.on('reconnected', function () {
		if(process.env.NODE_ENV !== 'test') 
    	console.log('MongoDB reconnected!');
  });
  mongoose.connection.on('close', function () {
		if(process.env.NODE_ENV !== 'test') 
    	console.error('MongoDB closed!');
  });

  return connectToDb().then(function() {

    // Set up all models.
    require('../models');
    return;
  });
};


/**
* Connects to the database.
*/
function connectToDb() {

  // Use native promises.
  mongoose.Promise = global.Promise;

  // Connect and return promise.
  return mongoose.connect(DATABASE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    reconnectTries: 100,
    reconnectInterval: 500,
    keepAlive: 300000,
    connectTimeoutMS: 30000,
    ha: true,
		haInterval: 10000,
		useUnifiedTopology: true,
		useFindAndModify: false
  }).catch(function(err) {
    // To avoid promise not handled exception.
    console.error('Unable to connect MongoDB. If problem persists, please restart the server. Error: ' + err);
  });
}

module.exports = setup;
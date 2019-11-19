/**
* Users Tests.
*/
'use strict';

let request = require('supertest');
let chai = require('chai');
let { User } = require('../server/models');
const APP = require('../app');
let _orderBy = require('lodash/orderBy');

// Chai Vars
let expect = chai.expect;
let should = chai.should();

// Delete ALL users in database
beforeEach((done) => {
	User.deleteMany({}, (err) => {
		expect(err).equal(null)
		done();
	});
})

describe('GET /users', () => {

	it('it should return ALL users (empty)', (done) => {

		request(APP)
		.get('/users')
		.expect('Content-Type', /json/)
    .expect(200)
		.end((err, res) => {
			expect(err).equal(null);
			expect(res.body.users).to.be.a('array');
			expect(res.body.users.length).equal(0);
			done()
		});

	});

	it('it should return ALL users sorted by username DESC', (done) => {
		
		let users = [
			{
				username: 'test-1',
				age: 20
			},
			{
				username: 'test-2',
				gender: 'female'
			},
			{
				username: 'test-3',
				name: 'Testing, Testing'
			}
		]

		User.create(users, function(err, res) {

			expect(err).eq(null)

			request(APP)
			.get('/users')
			.query({
				sort_by: 'username',
				order_by: -1
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				let sortedUsers = _orderBy(users, 'username', 'desc');
				expect(err).equal(null);
				expect(res.body.users).to.be.a('array');
				expect(res.body.users.length).equal(3);
				expect(res.body.users[0].username).equal(sortedUsers[0].username);
				expect(res.body.users[1].username).equal(sortedUsers[1].username);
				expect(res.body.users[2].username).equal(sortedUsers[2].username);
				done();
			});

		})

	})

})

describe('GET /users/:userId', () => {

	it('it should return the user with the given id', (done) => {

		let user = {
			username: 'test-1',
			name: 'I\'m a simple test',
			age: 20,
			gender: 'male'
		};

		User.create(user, function(errUser, createdUser) {

			expect(errUser).equal(null);

			request(APP)
			.get(`/users/${createdUser.id}`)
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).equal(null);
				expect(res.body.user).to.be.a('object');
				expect(res.body.user._id).equal(createdUser.id);
				expect(res.body.user.username).equal(createdUser.username);
				expect(res.body.user.age).equal(createdUser.age);
				expect(res.body.user.gender).equal(createdUser.gender);
				done();
			});

		})

	})

})

describe('POST /users', () => {

	it('should return validation errors for a invalid user', (done) => {
		
		let user = {
			username: null,
			age: -5,
			gender: 'im-not-a-gender'
		}

		request(APP)
		.post('/users')
		.send(user)
		.expect('Content-Type', /json/)
    .expect(400)
		.end((err, res) => {
			expect(err).equal(null);
			expect(res.body.err.msg).equal('invalid-user');
			expect(res.body.err.info.errors).to.have.keys(['username', 'age', 'gender']);
			done()
		});

	})

	it('it should create a user with all info', (done) => {

		let user = {
			username: 'test-1',
			name: "Testing 1",
			age: 25,
			gender: 'male'
		}

		request(APP)
		.post('/users')
		.send(user)
		.expect('Content-Type', /json/)
    .expect(200)
		.end((err, res) => {
			expect(err).equal(null);
			expect(res.body.createdUser._id).exist;
			expect(res.body.createdUser.username).equal(user.username);
			expect(res.body.createdUser.name).equal(user.name);
			expect(res.body.createdUser.age).equal(user.age);
			expect(res.body.createdUser.gender).equal(user.gender);
			done()
		});

	})

	it('it should create a user with only specified info', (done) => {

		let user = {
			username: 'test-2'
		}

		request(APP)
		.post('/users')
		.send(user)
		.expect('Content-Type', /json/)
    .expect(200)
		.end((err, res) => {
			expect(err).equal(null);
			expect(res.body.createdUser._id).exist;
			expect(res.body.createdUser.username).equal(user.username);
			expect(res.body.createdUser.name).equal(undefined);
			expect(res.body.createdUser.age).equal(undefined);
			expect(res.body.createdUser.gender).equal(undefined);
			done()
		});
	})

})

describe ('PUT /users/:userId', () => {

	it('it should update the user info of the given ID', (done) =>{
		
		let user = {
			username: 'mistake',
			name: 'I\'m a mistake',
			age: 2
		};

		let userChanges = {
			username: 'not-mistake',
			name: 'I\'m not a mistake!',
			age: 20
		}

		User.create(user, function(errUser, createdUser){
			expect(errUser).equal(null);

			request(APP)
			.put(`/users/${createdUser.id}`)
			.send(userChanges)
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).equal(null);
				expect(res.body.user).to.be.a('object');
				expect(res.body.user._id).equal(createdUser.id);
				expect(res.body.user.username).equal(userChanges.username);
				expect(res.body.user.age).equal(userChanges.age);
				expect(res.body.user.name).equal(userChanges.name);
				done();
			});

		})

	})

})

describe('DELETE /users/:userId', () => {

	it('it should delete user with given ID', (done) => {

		let user = {
			username: 'test-delete',
			name: 'i\'m gonna be deleted',
			age: 21,
			gender: 'male'
		}

		User.create(user, async function(errUser, createdUser){
			expect(errUser).equal(null);

			request(APP)
			.delete(`/users/${createdUser.id}`)
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).equal(null);
				expect(res.body.ok).equal(true);

				User.findOne({ _id: createdUser.id }, function(delUserErr, delUser){

					expect(delUserErr).equal(null);
					expect(delUser).not.equal(null);
					expect(delUser.id).equal(createdUser.id);
					expect(delUser._deleted).equal(true);
					done();

				})

			});

		})

	})

});
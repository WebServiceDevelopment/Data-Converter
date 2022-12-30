/**
 
 Apache-2.0 License

 Copyright 2020 - 2022 Web Service Development Inc.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

Author: Ogawa Kousei (kogawa@wsd.co.jp)
        
**/


"use strict";

// Router

const express = require('express');
const router = express.Router();
module.exports = router;

// Include Libraries

const bcrypt = require('bcrypt')

// Local Modules

const {
	execute
} = require('../model/mysql.js');

// Define Endpoint Handlers

router.get('/getLoginStatus', async (req, res) => {

	console.log(req.session.data);

	res.json({
		err: req.session.data ? 0 : 1,
		msg: '',
		session_data : req.session.data
	});

});

router.post('/handleLogin', async (req, res) => {

	const {
		username,
		password,
		remember
	} = req.body;
	
	// Declare log SQL to use as needed

	const logSql = `
		INSERT INTO log_login_attempts(
			username_input,
			username_match,
			login_result,
			session_id,
			reason
		) VALUES (
			?,
			?,
			?,
			?,
			?
		)
	`;

	// First we check to see if the user exists

	const selectSql = `
		SELECT
			staff_uuid,
			staff_email,
			staff_name,
			staff_hash,
			locked
		FROM
			dat_staff
		WHERE
			removed_on IS NULL
		AND
			staff_email = ?
	`;

	const selectArgs = [ username ];
	const exists = await execute(selectSql, selectArgs);

	// If no user was found, return not found

	if(exists.length === 0) {
		
		const logArgs = [
			username,
			0,
			0,
			'',
			'USERNAME_NOT_FOUND'
		];

		await execute(logSql, logArgs);
		return res.json({
			err: 1000,
			msg: 'USERNAME_NOT_FOUND'
		});

	}

	// Check if user account is locked

	const [ sessionData ] = exists;
	const isLocked = sessionData.locked;

	if(isLocked === 1) {
		
		const logArgs = [
			username,
			1,
			0,
			'',
			'ACCOUNT_IS_LOCKED'
		];

		await execute(logSql, logArgs);
		return res.json({
			err: 1001,
			msg: 'ACCOUNT_IS_LOCKED'
		});

	}

	// Check to see if password is valid
	
	const isValid = await bcrypt.compare(password, sessionData.staff_hash);

	if(!isValid) {

		const logArgs = [
			username,
			1,
			0,
			'',
			'INCORRECT_PASSWORD'
		];

		await execute(logSql, logArgs);

		// Check for how many incorrect attempts have been
		// made for this user in the last 4 hours

		const checkLockedSql = `
			SELECT
				login_result
			FROM
				log_login_attempts
			WHERE
				username_input = ?
			AND
				username_match = 1
			AND
				created_on > NOW() - INTERVAL 4 HOUR
			ORDER BY
				login_serial DESC
			LIMIT 10
		`;
		
		const isLockedArgs = [ username ];
		const logs = await execute(checkLockedSql, isLockedArgs);

		// We only care about consecutive failures
		// break on the last successful login

		let remain = 10;
		for(let i = 0; i < logs.length; i++) {
			if(logs[i].login_result == 1) {
				break;
			}
			remain--;
		}

		// If there haven't been 10 consecutive failures,
		// then we return incorrect password

		if(remain > 0) {
		
			return res.json({
				err: 1002,
				count: remain,
				msg: 'INCORRECT_PASSWORD'
			});

		}

		// If we have 10 consecutive login attempts in 4 hours,
		// then we lock the account for safety

		const setAccountLocked = `
			UPDATE
				dat_staff
			SET
				locked = 1
			WHERE
				staff_email = ?
		`;
		
		const setLockedArgs = [ username ];
		await execute(setAccountLocked, setLockedArgs);
		
		return res.json({
			err: 1003,
			count: remain,
			msg: 'SET_ACCOUNT_LOCKED'
		});

	}

	// Set session data to redis
	

	delete sessionData.staff_hash;
	req.session.data = sessionData;

	console.log(remember);
	if(remember){
		req.session.cookie.maxAge = 2628000000;
	}

	req.session.save(async (err) => {

		console.log('login id', req.session.id);

		const logArgs = [
			username,
			1,
			1,
			req.session.id,
			'LOGIN_SUCCESS'
		];

		await execute(logSql, logArgs);
		res.json(sessionData);
	});

});

router.get('/handleLogout', async (req, res) => {

	console.log('destroy session');
	
	req.session.data = null;
	req.session.destroy(async (err) => {
		
		console.log('session destroyed');
		return res.json({
			err: 0
		});
	});

});

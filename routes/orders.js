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

// Import Router

const express = require('express');
const router = express.Router();
module.exports = router;

// Import Libraries

const moment = require('moment');

// Connect To Database

const {
	execute
} = require('../model/mysql.js');

// Define End Points

router.post('/processed_data', async (req, res) => {

	const {
		order_source,
		order_no,
		order_date
	} = req.body;

	const sql = `
		SELECT
			processed_data
		FROM
			dat_ipfs_store
		WHERE
			order_source = ?
		AND
			order_no = ?
		AND
			order_date = DATE(?)
	`;

	const args = [
		order_source,
		order_no,
		order_date
	];

	var  results;
	try {
		results = await execute(sql, args);
	} catch (e) {
		return res.status(500).end('/processed_data execute error');
	}
	if (results.length === 0) {
		return res.status(400).end('not found');
	}

	const json = JSON.parse(results[0].processed_data);
	const str = JSON.stringify(json, null, 2);
	const buffer = Buffer.from(str);
	const name = `${order_source}_${order_date}_${order_no}.json`;

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Content-disposition': `attachment;filename=${name}`,
		'Content-Length': buffer.length
	});

	return res.end(buffer);

});

router.post('/incoming_data', async (req, res) => {

	const {
		order_source,
		order_no,
		order_date
	} = req.body;

	const sql = `
		SELECT
			incoming_data
		FROM
			dat_ipfs_store
		WHERE
			order_source = ?
		AND
			order_no = ?
		AND
			order_date = DATE(?)
	`;

	const d = moment(req.body.order_date);

	const args = [
		order_source,
		order_no,
		d.format('yyyy-MM-DD')
	];

	var  results;

	try {
		results = await execute(sql, args);
	} catch (e) {
		return res.status(500).end('/processed_data execute error');
	}
	
	if (results.length === 0) {
		return res.status(400).end('not found');
	}

	const json = JSON.parse(results[0].incoming_data);
	const str = JSON.stringify(json, null, 2);
	const buffer = Buffer.from(str);
	const name = `${order_source}_${d.format('yyyy-MM-DD')}_${order_no}.json`;

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Content-disposition': `attachment;filename=${name}`,
		'Content-Length': buffer.length
	});

	return res.end(buffer);

});

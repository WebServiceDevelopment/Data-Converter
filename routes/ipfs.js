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

// Libraries

// const ipfs = require('ipfs-http-client');
// const client = ipfs.create();
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const moment = require('moment');
const Hash = require('ipfs-only-hash')

// Local Modules

const {
	execute
} = require('../model/mysql.js');

const client = {
	add : async(
		content // Buffer
	) => {
		const cid = await Hash.of(content)
		console.log(cid);
		await fs.writeFile(`./public/ipfs/${cid}`, content);
		return { cid };
	}
};

// Callback Functions

router.post('/get', async (req, res) => {

	const sql = `
		SELECT
			ipfs_files
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
	//console.log(d.format('yyyy-MM-DD'));

	const args = [
		req.body.order_source,
		req.body.order_no,
		d.format('yyyy-MM-DD')
	];

	var results;
	try {
		results = await execute(sql, args);
	} catch(e) {
		console.log("/get execute error");

		return res.status(500).end('/get execute error');
	}

	if (results.length === 0) {
		return res.status(400).end('not found');
	}

	const files = JSON.parse(results[0].ipfs_files);

	// PDF
	if (files.length === 1) {
		const url = `./public/ipfs/${files[0].hash}`;
		const buffer = await fs.readFile(url);
		res.writeHead(200, {
			'Content-Type': 'application/pdf',
			'Content-disposition': 'attachment;filename=' + files[0].name,
			'Content-Length': buffer.length
		});
		return res.end(buffer);
	}

	// Otherwise CSV

	const zip = new AdmZip();
	for (let i = 0; i < files.length; i++) {
		const url = `./public/ipfs/${files[i].hash}`;
		const buffer = await fs.readFile(url);
		zip.addFile(files[i].name, buffer);
	}

	const buffer = zip.toBuffer();
	//console.log(buffer);

	const name = files[0].name.split('.');
	name.pop();
	name.push('zip');

	res.writeHead(200, {
		'Content-Type': 'application/zip',
		'Content-disposition': 'attachment;filename=' + name.join('.'),
		'Content-Length': buffer.length
	});
	return res.end(buffer);

});


router.post('/set', async (req, res) => {

	const sql = `
		INSERT INTO dat_ipfs_store (
			order_source,
			order_no,
			order_date,
			delivery_date,
			recipient_name,
			amount,
			ipfs_hash,
			ipfs_files,
			incoming_data
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?
		) ON DUPLICATE KEY UPDATE
			process_time = NOW()
	`;

	// Data

	const data = JSON.parse(req.body.data);

	// UTUSMI

	if (req.files.pdf) {

		const pdfContent = await client.add(req.files.pdf.data);
		const files = [{
			name: req.files.pdf.name,
			hash: pdfContent.cid.toString()
		}];

		for (let i = 0; i < data.length; i++) {
			const order = data[i];

			let amount = 0;
			order.products.forEach((detail) => {
				// change 20220301
				//amount += parseInt(detail.subtotal);
				if (detail.subtotal.indexOf(",") !== -1) {
					amount += parseInt(detail.subtotal.replace(/,/g, ''));
				} else {
					amount += parseInt(detail.subtotal);
				}
			});

			const args = [
				'UTSUMI',
				order.order_no,
				order.order_date,
				order.delivery_date.replace(/\//g, '-'),
				order.recipient.name,
				amount,
				pdfContent.cid.toString(),
				JSON.stringify(files),
				JSON.stringify(order),
			];

			try {
				const result = await execute(sql, args);
			} catch (e) {
				console.log("/set execute error");

				return res.status(500).end('/set execute error');
				
			}
		}

		return res.json([pdfContent.cid.toString()]);
	}

	// JANBURE

	if (req.files.header && req.files.meisai) {
		
		// Get IPFS Hashes

		const headerContent = await client.add(req.files.header.data);
		const meisaiContent = await client.add(req.files.meisai.data);
		const ipfs_hashes = [
			headerContent.cid.toString(),
			meisaiContent.cid.toString()
		]

		const files = [{
				name: req.files.header.name,
				hash: headerContent.cid.toString()
			},
			{
				name: req.files.meisai.name,
				hash: meisaiContent.cid.toString()
			}
		];

		const ipfs_string = ipfs_hashes.join(',');

		// Get Delivery Date

		for (let i = 0; i < data.length; i++) {
			const order = data[i];

			const default_delivery = moment(order.order_date);
			default_delivery.add(3, 'days');

			const args = [
				'JANBURE',
				order.order_no,
				order.order_date,
				default_delivery.format('yyyy-MM-DD'),
				order.recipient.name,
				order.total_order_amount,
				ipfs_string,
				JSON.stringify(files),
				JSON.stringify(order),
			];

			try {
				const result = await execute(sql, args);
			} catch (e) {
				console.log("/set execute error");

				return res.status(500).end('/set execute error');
			}
		}

		return res.json(ipfs_hashes);
	}

	return res.status(400).end('invalid request');

});

router.post('/search', async (req, res) => {

	const sql = [`
		SELECT
			order_source,
			order_no,
			order_date,
			delivery_date,
			recipient_name,
			amount,
			processed_flag,
			ipfs_files,
			confirm_time
		FROM
			dat_ipfs_store
		WHERE
	`];

	const args = [];

	// 1. Order Source
	if (req.body.system !== '') {
		sql.push('order_source = ?');
		args.push(req.body.system);
	}

	// 2. Order Date Start
	if (req.body.order_date_start !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('order_date >= ?');

		args.push(req.body.order_date_start);
	}

	// 3. Order Date End
	if (req.body.order_date_end !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('order_date <= ?');
		const d = moment(req.body.order_date_end);

		//console.log(d.format('yyyy-MM-DD'));
		args.push(d.format('yyyy-MM-DD'));
	}

	// 4. Delivery Date Start
	if (req.body.delivery_date_start !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}

		sql.push('delivery_date >= ?');

		args.push(req.body.delivery_date_start);
	}

	// 5. Delivery Date End
	if (req.body.delivery_date_end !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('delivery_date <= ?');
		const d = moment(req.body.delivery_date_end);


		args.push(d.format('yyyy-MM-DD'));
	}

	// 6. Delivery Date Start
	if (req.body.amount_min !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('amount >= ?');
		args.push(req.body.amount_min);
	}

	// 7. Delivery Date End
	if (req.body.amount_max !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('amount <= ?');
		args.push(req.body.amount_max);
	}

	// 8. Customer Name
	if (req.body.customer !== '') {
		if (sql.length > 1) {
			sql.push('AND');
		}
		sql.push('recipient_name LIKE ?');
		args.push(`%${req.body.customer}%`);
	}

	if (sql.length === 1) {
		sql.push('1');
	}

	var results;
	try {
		results = await execute(sql.join(' '), args);
	} catch(e) {
		console.log("/set execute error");

		return res.status(500).end('/search execute error');
	}

	for (let i = 0; i < results.length; i++) {
		results[i].ipfs_files = JSON.parse(results[i].ipfs_files);
	}
	res.json(results);

});

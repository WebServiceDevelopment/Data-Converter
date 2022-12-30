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

const uuidv4 = require('uuid').v4;

// Import Execute

const {
	execute
} = require('../model/mysql.js');


// Define Table Name

const PRODUCTS_TABLE_NAME = 'dat_products3';
const LOG_TABLE_NAME = 'log_products2';
const ORDERS_TABEL_NAME = 'dat_orders2';


// Define Exports

// 20220316 k.ogawa
router.post('/getProductHistory', async (req, res) => {

	const {
		my_company_code
	} = req.body;

	// First 

	const sql = `
		SELECT
			user_uuid,
			action,
			old_value,
			new_value,
			logged_on
		FROM
			${LOG_TABLE_NAME}
		WHERE
			my_company_code = ?
		ORDER BY
			logged_on DESC
		LIMIT 100
	`;

	const args = [
		my_company_code
	];

	const exists = await execute(sql, args);

	if (exists.length == 0) {
		return res.json([]);
	}

	var rows = exists;
	for (var i = 0; i < rows.length; i++) {

		if (rows[i].old_value) {
			rows[i].old_value = JSON.parse(rows[i].old_value);
		}

		if (rows[i].new_value) {
			rows[i].new_value = JSON.parse(rows[i].new_value);
		}

	}

	return res.json(rows);
});


// 20220317 k.ogawa
router.post('/removeProduct', async (req, res) => {

	const {
		jyanbure_code,
		my_company_code
	} = req.body;


	// First Check if the code dosen't Exist

	let sql = `
		SELECT
			COUNT(*) AS num
		FROM
			${PRODUCTS_TABLE_NAME}
		WHERE
			jyanbure_code = ?
		AND	
			my_company_code = ?
	`;

	const args = [
		jyanbure_code,
		my_company_code
	];

	//console.log(args);

	const exists = await execute(sql, args);
	if (exists[0].num == 0) {

		return res.json({
			"msg": -1
		});

	}

	const deleteSql = `
		DELETE FROM
			${PRODUCTS_TABLE_NAME}
		WHERE
			jyanbure_code = ?
		AND	
			my_company_code = ?
	`;

	const results = await execute(deleteSql, args);

	return res.json({
		"msg": 1
	});

});

// 20220317 k.ogawa
router.post('/updateProduct', async (req, res) => {

	const {
		jyanbure_code,
		my_company_code,
		jyanbure_name,
		my_company_name,
		inner_count,
		last_price0,
		last_price1
	} = req.body;

	// First Check if the code dosen't Exist

	let sql = `
		SELECT
			COUNT(*) AS num
		FROM
			dat_products3
		WHERE
			jyanbure_code = ?
		OR
			my_company_code = ?
	`;

	const args = [
		jyanbure_code,
		my_company_code
	];


	var exists = await execute(sql, args);

	//console.log("args="+args+":exists[0].num="+exists[0].num);

	if (exists[0].num == 0) {

		const insertSql = `
			INSERT INTO ${PRODUCTS_TABLE_NAME} (
				jyanbure_code,
				jyanbure_name,
				my_company_code,
				my_company_name,
				inner_count,
				last_price0,
				last_price1
			) VALUES (
				?, ?, ?, ?, ?, ?, ?
			)
		`;

		const insertArgs = [
			jyanbure_code,
			jyanbure_name,
			my_company_code,
			my_company_name,
			inner_count,
			last_price0,
			last_price1
		];

		const insertResults = execute(insertSql, insertArgs);

		return res.json({
			"msg": 1,
			"action": "insert"
		});

	}

	// Second Check if the code dosen't Exist

	sql = `
		SELECT
			COUNT(*) AS num
		FROM
			dat_products3
		WHERE
			jyanbure_code = ?
		AND	
			my_company_code = ?
		`;

	exists = await execute(sql, args);

	if (exists[0].num == 0) {

		return res.json({
			"msg": -1,
			"error": "Code does not match."
		});

	}

	// If not, then we update the database

	const updateSQL = `
		UPDATE
			${PRODUCTS_TABLE_NAME}
		SET
			jyanbure_name = ?,
			my_company_name = ?,
			inner_count = ?,
			last_price0 = ?,
			last_price1 = ?
		WHERE
			jyanbure_code = ?
		AND
			my_company_code = ?
	`;

	const updateArgs = [
		jyanbure_name,
		my_company_name,
		inner_count,
		last_price0,
		last_price1,
		jyanbure_code,
		my_company_code
	];

	const updateResult = await execute(updateSQL, updateArgs);

	return res.json({
		"msg": 1,
		"action": "update"
	});

});


router.post('/selectProducts', async (req, res) => {

	const sql = `
		SELECT
			jyanbure_code,
			jyanbure_name,
			my_company_code,
			my_company_name,
			inner_count,
			last_price0,
			last_price1
		FROM
			dat_products3
		ORDER BY
			my_company_code ASC
	`;

	const args = [];
	const result = await execute(sql, args);
	res.json(result);

});


// 20220316 k.ogawa
router.post('/registerProduct', async (req, res) => {

	const {
		jyanbure_code,
		jyanbure_name,
		my_company_code,
		my_company_name,
		inner_count,
		last_price0,
		last_price1
	} = req.body;


	let sql = `
		SELECT
			COUNT(*) AS num
		FROM
			dat_products3
		WHERE
			my_company_code = ?
	`;

	let args = [my_company_code];

	const result = await execute(sql, args);

	if (result[0].num != 0) {
		res.json({
			"err": 1,
			"msg": "Code Already exists"
		});

	}

	sql = `
		INSERT INTO dat_products3 (
			jyanbure_code,
			jyanbure_name,
			my_company_code,
			my_company_name,
			inner_count,
			last_price0,
			last_price1
		) VALUES (
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?
		)
	`;

	args = [
		jyanbure_code,
		jyanbure_name,
		my_company_code,
		my_company_name,
		inner_count,
		last_price0,
		last_price1
	];

	const rt = await execute(sql, args);
	//console.log("insertId="+rt.insertId);

	res.json({
		"err": 0,
		"msg": "okey"
	});

});


// 20220315 k.ogawa
router.post('/searchOrders', async (req, res) => {

	const {
		search_term,
		search_key,
		exclude
	} = req.body;

	const lookup = [
		"order_no",
		"order_number",
		"customer_no",
		"recipient_no"
	];

	if (lookup.indexOf(search_term) === -1) {
		return null;
	}

	let sql = `
		  SELECT
			order_uuid,
			order_no,
			order_date,
			supply,
			customer,
			recipient,
			details,
			destination_division,
			warehouse,
			order_number,
			cash_on_delivery_amount,
			order_amount,
			consumption_tax,
			total_order_amount,
			cash_on_delivery_division,
			contact
		  FROM
			${ORDERS_TABEL_NAME}
		  WHERE
			${search_term}  = ?
	`;

	let args = [search_key];

	if (exclude.length !== 0) {
		sql = sql.concat(" ", "AND");
		sql = sql.concat(" ", "order_uuid NOT IN (");

		for (let i = 0; i < exclude.length; i++) {
			if (i) {
				sql = sql.concat(" ", ",");
			}

			sql = sql.concat(" ", "?");
			args = args.concat(" ", exclude[i]);
		}

		sql = sql.concat(" ", ")");
	}

	sql = sql.concat(" ", "ORDER BY order_serial DESC");
	sql = sql.concat(" ", "LIMIT 25");

	//console.log(sql);
	const results = await execute(sql, args);

	for (let i = 0; i < results.length; i++) {
		results[i].customer = JSON.parse(results[i].customer);
		results[i].details = JSON.parse(results[i].details);
		results[i].recipient = JSON.parse(results[i].recipient);
		results[i].supply = JSON.parse(results[i].supply);
		results[i].warehouse = JSON.parse(results[i].warehouse);
	}

	res.json(results);

});


router.post('/insertOrders', async (req, res) => {

	const {
		list
	} = req.body;

	var uuids = [];

	const select = `
		  SELECT
				order_uuid
		  FROM
				${ORDERS_TABEL_NAME}
		  WHERE
				order_no = ?
		  AND
				order_date = ?
		  LIMIT 1
	 `;

	const insert = `
		INSERT INTO ${ORDERS_TABEL_NAME} (
			order_uuid,
			order_no,
			order_date,
			supply,
			customer_no,
			customer,
			recipient_no,
			recipient,
			details,
			destination_division,
			warehouse,
			order_number,
			cash_on_delivery_amount,
			order_amount,
			consumption_tax,
			total_order_amount,
			cash_on_delivery_division,
			contact
		) VALUES (
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?,
			?, 
			?, 
			?, 
			?
		)
	`;

	let args, results, order_uuid;

	for (let i = 0; i < list.length; i++) {

		const order = list[i];

		// Check if the order already exists

		args = [
			order.order_no,
			order.order_date
		];

		results = await execute(select, args);
		if (results.length) {
			uuids.push(results[0].order_uuid);
			continue;
		}

		// Insert Order

		order_uuid = uuidv4();
		uuids.push(order_uuid);

		args = [
			order_uuid,
			order.order_no,
			order.order_date,
			JSON.stringify(order.supply),
			order.customer.id,
			JSON.stringify(order.customer),
			order.recipient.id,
			JSON.stringify(order.recipient),
			JSON.stringify(order.details),
			order.destination_division,
			JSON.stringify(order.warehouse),
			order.order_number,
			order.cash_on_delivery_amount,
			order.order_amount,
			order.consumption_tax,
			order.total_order_amount,
			order.cash_on_delivery_division,
			order.contact
		];

		results = await execute(insert, args);
	}

	res.json(uuids);

});


router.post('/processed_data', async (req, res) => {

	const orders = req.body;

	const order_source = 'JANBURE';

	const sql = `
		UPDATE
			dat_ipfs_store
		SET
			processed_data = ?,
			processed_flag = 1,
			confirm_time = NOW()
		WHERE
			order_source = ?
		AND
			order_no = ?
		AND
			order_date = DATE(?)
	`;

	for (let i = 0; i < orders.length; i++) {
		const {
			order_no,
			order_date
		} = orders[i];
		const processed_data = JSON.stringify(orders[i]);

		const args = [
			processed_data,
			order_source,
			order_no,
			order_date
		];

		const result = await execute(sql, args);
	}

	res.json({
		"msg": "okay"
	});

});


// 20220318 k.ogawa
router.post('/batchUpdate', async (req, res) => {

	const list = req.body.batchData;

	// 全テーブルを削除
	const reset_sql = "TRUNCATE TABLE " + PRODUCTS_TABLE_NAME;
	const rt = execute(reset_sql);


	const insert_sql = `
		INSERT INTO ${PRODUCTS_TABLE_NAME} (
			jyanbure_code,
			jyanbure_name,
			my_company_code,
			my_company_name,
			inner_count,
			last_price0,
			last_price1
		) VALUES (
			?, 
			?, 
			?, 
			?, 
			?, 
			?, 
			?
		)
	`;

	let product, args, results

	for (let i = 0; i < list.length; i++) {

		product = list[i];

		args = [
			product.jyanbure_code,
			product.jyanbure_name,
			product.my_company_code,
			product.my_company_name,
			product.inner_count,
			product.last_price0,
			product.last_price1
		];

		// Insert 
		results = execute(insert_sql, args);

	}

	res.json({
		"msg": "okay"
	});
});

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


// Connect To Database

const {
	execute
} = require('../model/mysql.js');


// Import Libraries

const uuidv4 = require('uuid').v4;


// Define Table Name

const PRODUCTS_TABLE_NAME = 'dat_products2';
const LOG_TABLE_NAME = 'log_products2';
const ORDERS_TABEL_NAME = 'dat_orders';


// Define Endpoints

// 20220314 k.ogawa
router.post('/getProductHistory', async (req, res) => {

	const LIMIT = 100;

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
		LIMIT  ${LIMIT}
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


// 20220315 k.ogawa
router.post('/removeProduct', async (req, res) => {

	const {
		staff_uuid 
	} = req.session.data;


	const {
		my_company_code,
		utsumi_code,
		product_name,
		utsumi_price,
		case_count
	} = req.body;

	const data = {
		"my_company_code": my_company_code,
		"utsumi_code": utsumi_code,
		"product_name": product_name,
		"utsumi_price": utsumi_price,
		"case_count": case_count
	}

	// First Check if the code dosen't Exist

	const sql = `
		SELECT
			my_company_code,
			utsumi_code,
			product_name,
			case_count,
			utsumi_price
		FROM
			${PRODUCTS_TABLE_NAME}
		WHERE
			my_company_code = ?
	`;

	const args = [
		my_company_code
	];

	//console.log(args);

	const exists = await execute(sql, args);
	if (exists.length == 0) {

		return res.json({
			"msg": -1
		});

	}

	const deleteSql = `
                DELETE FROM
			${PRODUCTS_TABLE_NAME}
                WHERE
			my_company_code = ?
	`;

	const results = await execute(deleteSql, args);

	//console.log(args);

	let ex = exists[0];


	var old_data = {
		"my_company_code": ex.my_company_code,
		"utsumi_code": ex.utsumi_code,
		"product_name": ex.product_name,
		"case_count": ex.case_count,
		"utsumi_price": ex.utsumi_price
	};

	//console.log(old_data);

	// Then we leave a log for when the product was created

	const logSql = `
		INSERT INTO ${LOG_TABLE_NAME} (
			user_uuid,
			my_company_code,
			action,
			old_value,
			new_value
		) VALUES (
			?,
			?,
			?,
			?,
			?
		)
	`;

	const logArgs = [
		staff_uuid,
		my_company_code,
		'remove',
		JSON.stringify(old_data),
		JSON.stringify(data)
	];

	await execute(logSql, logArgs);

	return res.json({
		"msg": 1
	});

});

// 20220314 k.ogawa
router.post('/updateProduct', async (req, res) => {

	//console.log(req.session.data);

	const {
		staff_uuid 
	} = req.session.data;

	const {
		my_company_code,
		utsumi_code,
		product_name,
		utsumi_price,
		case_count
	} = req.body;

	const data = {
		"my_company_code": my_company_code,
		"utsumi_code": utsumi_code,
		"product_name": product_name,
		"utsumi_price": utsumi_price,
		"case_count": case_count
	}

	// First Check if the code dosen't Exist

	const sql = `
		SELECT
			my_company_code,
			utsumi_code,
			product_name,
			case_count,
			utsumi_price
		FROM
			${PRODUCTS_TABLE_NAME}
		WHERE
			my_company_code = ?
	`;

	const args = [
		my_company_code
	];

	//console.log(args);

	const exists = await execute(sql, args);
	if (exists.length == 0) {

		return res.json({
			"msg": -1
		});

	}

	let ex = exists[0];

	var old_data = {
		"my_company_code": ex.my_company_code,
		"utsumi_code": ex.utsumi_code,
		"product_name": ex.product_name,
		"case_count": ex.case_count,
		"utsumi_price": ex.utsumi_price
	};

	//console.log(old_data);

	// If not, then we update the database

	const updateSQL = `
		UPDATE
			${PRODUCTS_TABLE_NAME} 
		SET
			utsumi_code = ? ,
			product_name = ? ,
			case_count = ? ,
			utsumi_price = ? ,
			updated_on = NOW()
		WHERE
			my_company_code = ?
			
	`;

	const updateArgs = [
		data.utsumi_code,
		data.product_name,
		data.case_count,
		data.utsumi_price,
		data.my_company_code
	];

	const updateResult = await execute(updateSQL, updateArgs);

	// Then we leave a log for when the product was created

	const logSql = `
		INSERT INTO ${LOG_TABLE_NAME} (
			user_uuid,
			my_company_code,
			action,
			old_value,
			new_value
		) VALUES (
			?, ?, ?, ?, ?
		)
	`;

	const logArgs = [
		staff_uuid,
		my_company_code,
		'update',
		JSON.stringify(old_data),
		JSON.stringify(data)
	];

	await execute(logSql, logArgs);

	return res.json({
		"msg": 1
	});

});


router.post('/insertProduct', async (req, res) => {

	const {
		staff_uuid 
	} = req.session.data;

	const {
		my_company_code,
		utsumi_code,
		product_name,
		utsumi_price,
		case_count,
	} = req.body;

	// First Check if the code already Exists

	const existsSql = `
		SELECT
			created_on
		FROM
			` + PRODUCTS_TABLE_NAME + `
		WHERE
			my_company_code = ?
	`;

	const existsArgs = [
		my_company_code
	];

	const exists = await execute(existsSql, existsArgs);
	if (exists.length) {
		return res.json(-1);
	}

	// If not, then we insert into the database

	const insertSQL = `
		INSERT INTO ${PRODUCTS_TABLE_NAME} (
			my_company_code,
			utsumi_code,
			product_name,
			case_count,
			utsumi_price
		) VALUES (
			?, ?, ?, ?, ?
		)
	`;

	const insertArgs = [
		my_company_code,
		utsumi_code,
		product_name,
		case_count,
		utsumi_price
	];

	const insertResult = await execute(insertSQL, insertArgs);

	// Then we leave a log for when the product was created

	const logSql = `
		INSERT INTO ${LOG_TABLE_NAME} (
			user_uuid,
			my_company_code,
			action,
			new_value
		) VALUES (
			?,
			?,
			?,
			?
		)
	`;

	const logArgs = [
		'debug_staff_uuid',
		my_company_code,
		'insert',
		JSON.stringify(req.body)
	];

	await execute(logSql, logArgs);

	return res.json(1);

});


router.post('/storePDF', async (req, res) => {

	const data = req.body.orders;
	let args, results;

	var uuids = [];

	var check = `
		  SELECT
				order_uuid
		  FROM
				dat_orders
		  WHERE
				pdf_no = ?
		  AND
				pdf_date = ?
		  AND
				order_no = ?
		  AND
				customer_no = ?
		  LIMIT 1
	 `;

	var sql = `
		  INSERT INTO dat_orders (
				order_uuid,
				pdf_no,
				pdf_date,
				order_no,
				delivery_date,
				shipment_confirmation_date,
				customer_no,
				organization_no,
				contact,
				recipient,
				shipper,
				has_change,
				notes,
				delivery_notice,
				shipper_notice,
				products
		  ) VALUES (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?, ?
		  ) ON DUPLICATE KEY UPDATE
		  touched_on = NOW()
	 `;

	for (var i = 0; i < data.length; i++) {

		if (data[i].title) {
			continue;
		}

		var order_uuid = uuidv4();
		var order = data[i];

		var delivery_date = order.delivery_date.split("/");
		var shipment_confirmation_date = order.shipment_confirmation_date.split("/");

		args = [
			order.no,
			order.order_date,
			order.order_no,
			order.customer_no
		];

		results = await execute(check, args);
		if (results.length) {
			uuids.push(results[0].order_uuid);
			continue;
		}

		args = [
			order_uuid,
			order.no,
			order.order_date,
			order.order_no,
			delivery_date.join("-"),
			shipment_confirmation_date.join("-"),
			order.customer_no,
			order.organization_no,
			order.contact,
			JSON.stringify(order.recipient),
			JSON.stringify(order.shipper),
			order.has_change ? 1 : 0,
			order.notes,
			order.delivery_notice,
			order.shipper_notice,
			JSON.stringify(order.products)
		];

		results = await execute(sql, args);
		uuids.push(order_uuid);

	}

	return res.json(uuids);

});


// c450.js c500.jsには無い
router.post('/registerRemove', async (req, res) => {

	const sql = `
		INSERT INTO dat_fixing2 (
			customer_no,
			invalid_date,
			invalid_order_no,
			invalid_organization_no,
			remove_date,
			remove_order_no,
			remove_organization_no
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?
		) ON DUPLICATE KEY UPDATE
			fix_serial = fix_serial
	`;

	const args = [
		req.body.customer_no,
		req.body.invalid.date,
		req.body.invalid.order_no,
		req.body.invalid.organization_no,
		req.body.remove.date,
		req.body.remove.order_no,
		req.body.remove.organization_no,
	];

	const result = await execute(sql, args);
	res.end('okay');

});


router.post('/registerUpdate', async (req, res) => {

	const sql = `
		UPDATE
			dat_fixing2
		SET
			update_date = ?,
			update_order_no = ?,
			update_organization_no = ?
		WHERE
			customer_no = ?
		AND
			invalid_order_no = ?
		AND
			invalid_date LIKE ?
	`;

	const args = [
		req.body.update.date,
		req.body.update.order_no,
		req.body.update.organization_no,
		req.body.query.customer_no,
		req.body.query.order_no,
		req.body.query.date
	];

	const result = await execute(sql, args);
	res.end('okay');

});


// 20220313 add k.ogawa
router.post('/getFixOrders2', async (req, res) => {

	const {
		customer_no,
		find
	} = req.body;

	const sql = `
		SELECT
			order_uuid,
			pdf_no,
			pdf_date,
			order_no,
			delivery_date,
			shipment_confirmation_date,
			customer_no,
			organization_no,
			contact,
			recipient,
			shipper,
			has_change,
			notes,
			delivery_notice,
			shipper_notice,
			products
		FROM
			dat_orders
		WHERE
			customer_no = ?
		AND
			order_no = ?
		AND
			organization_no = ?
	`;

	var orders = [];

	for (var i = 0; i < find.length; i++) {

		// Invalid

		const args = [
			customer_no,
			find[i].order_no,
			find[i].organization_no
		]

		const results = await execute(sql, args);

		if (results.length < 1) {
			continue;
		}
		orders.push(result[0]);

	}

	return res.json(orders);

});

// 20220313 add k.ogawa
router.post('/lookupFixes2', async (req, res) => {

	const {
		order_no
	} = req.body;

	const sql = `
		SELECT
			fix_serial,
			customer_no,
			invalid_date,
			invalid_order_no,
			invalid_organization_no,
			remove_date,
			remove_order_no,
			remove_organization_no,
			update_date,
			update_order_no,
			update_organization_no
		FROM
			dat_fixing2
		WHERE
			invalid_order_no = ?
		AND
			remove_order_no = ?
		AND
			update_order_no = ?
	`;

	var args = [
		order_no,
		order_no,
		order_no
	];

	const results = await execute(sql, args);

	if (results.length == 0) {
		res.json(null);
		return;
	}

	return res.json(results[0]);

});


// 20220313 add k.ogawa
router.post('/executeSearch', async (req, res) => {

	const {
		query,
		key,
		exclude
	} = req.body;

	let search_term;

	switch (key) {
	case "customer_no":
		search_term = "customer_no";
		break;
	case "order_no":
		search_term = "order_no";
		break;
	default:
		return res.status(400).end('Invalid Search term');
		break;
	}

	let q = [];
	let args = [query];

	let sql = `
		SELECT
			order_uuid,
			pdf_no,
			pdf_date,
			order_no,
			delivery_date,
			shipment_confirmation_date,
			customer_no,
			organization_no,
			contact,
			recipient,
			shipper,
			has_change,
			notes,
			delivery_notice,
			shipper_notice,
			products
		FROM
			dat_orders
		WHERE
			${search_term} = ?
	`;

	if (exclude.length) {
		for (var i = 0; i < exclude.length; i++) {
			q.push("?");
			args.push(exclude[i]);

		}

		q = q.join(",");
		sql = sql.concat(" ", "AND");
		sql = sql.concat(" ", "order_uuid NOT IN (");
		sql = sql.concat(" ", q);
		sql = sql.concat(" ", ")");
	}

	sql = sql.concat(" ", "LIMIT 25");

	const results = await execute(sql, args);

	return res.json(results);

});


router.post('/selectFixes2', async (req, res) => {

	const {
		list
	} = req.body;
	const fixes = [];

	const sql = `
		SELECT
			fix_serial,
			customer_no,
			invalid_date,
			invalid_order_no,
			invalid_organization_no,
			remove_date,
			remove_order_no,
			remove_organization_no,
			update_date,
			update_order_no,
			update_organization_no
		FROM
			dat_fixing2
		WHERE
			( invalid_order_no = ? OR remove_order_no = ? OR update_order_no = ? )
		AND
			customer_no = ?
	`;

	for (var i = 0; i < list.length; i++) {

		// Invalid

		const args = [
			list[i].order_no,
			list[i].order_no,
			list[i].order_no,
			list[i].customer_no
		]

		const results = await execute(sql, args);
		results.forEach((row) => {
			fixes.push(row);
		});

	}

	return res.json(fixes);

});

// 20220314 add k.ogawa
router.post('/registerFix', async (req, res) => {

	const {
		a,
		b,
		c
	} = req.body;

	const sql = `
		 INSERT INTO dat_fixing (
			invalid_order_no,
			removed_order_no,
			updated_order_no
		 ) VALUES (
			?,
			?,
			?
		 ) ON DUPLICATE KEY UPDATE
			fix_serial = fix_serial
	`;

	var args = [a, b, c];

	const results = await execute(sql, args);

	return res.json({
		"msg": 1
	});

});

// 20220313 add k.ogawa
router.post('/lookupFixes2', async (req, res) => {

	const {
		order_no
	} = req.body;
	const fixes = [];

	const sql = `
		SELECT
			fix_serial,
			customer_no,
			invalid_date,
			invalid_order_no,
			invalid_organization_no,
			remove_date,
			remove_order_no,
			remove_organization_no,
			update_date,
			update_order_no,
			update_organization_no
		FROM
			dat_fixing2
		WHERE
			invalid_order_no = ?
		AND
			remove_order_no = ?
		AND
			update_order_no = ?
	`;

	const args = [
		order_no,
		order_no,
		order_no
	];

	const results = await execute(sql, args);

	if (results.length == 0) {
		return res.json(null);
	}

	return res.json(results[0]);

});

router.post('/selectProducts', async (req, res) => {

	const sql = `
		SELECT
			my_company_code,
			utsumi_code,
			product_name,
			case_count,
			utsumi_price
		FROM
			` + PRODUCTS_TABLE_NAME + `
		ORDER BY
			my_company_code ASC
	`;

	const args = [];

	const result = await execute(sql, args);

	return res.json(result);

});

router.post('/processed_data', async (req, res) => {

	const orders = req.body;

	const order_source = 'UTSUMI';

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
			order_date,
		];

		const result = await execute(sql, args);

	}

	return res.json({
		msg: 'okay'
	});

});

// 20220318 k.ogawa
router.post('/batchUpdate', async (req, res) => {

	const {
		staff_uuid 
	} = req.session.data;

	const list = req.body.batchData;

	const select_sql = `
		SELECT
			utsumi_code,
			product_name,
			case_count,
			utsumi_price,
		FROM
			${PRODUCTS_TABLE_NAME}
		WHERE
			my_company_code = ?
	`;

	const insert_sql = `
		INSERT INTO ${PRODUCTS_TABLE_NAME} (
			my_company_code,
			utsumi_code,
			product_name,
			case_count,
			utsumi_price,
		) VALUES (
			?, ?, ?, ?, ?
		)
	`;

	const update_sql = `
		UPDATE
			${PRODUCTS_TABLE_NAME}
		SET
			utsumi_code = ?,
			product_name = ?,
			case_count = ?,
			utsumi_price = ?,
		WHERE
			my_company_code = ?
	`;

	const history_sql = `
		INSERT INTO ${LOG_TABLE_NAME} (
			user_uuid,
			my_company_code,
			action,
			old_value,
			new_value
		) VALUES (
			?, ?, ?, ?, ?
		)
	`;

	let product, args, results;
	let sql, action, previous;

	for (let i = 0; i < list.length; i++) {

		product = list[i];

		args = [product.my_company_code];
		results = execute(select_sql, args);

		if (results.length == 0) {

			action = "insert";
			previous = null;
			sql = insert_sql;

			// Entry does not exist, insert

			args = [
				product.my_company_code,
				product.utsumi_code,
				product.product_name,
				product.case_count,
				product.utsumi_price
			];

			results = execute(insert_sql, args);

		} else {

			action = "update";
			previous = JSON.stringify(results[0]);
			sql = update_sql;

			// Entry does exist, update

			args = [
				product.utsumi_code,
				product.product_name,
				product.case_count,
				product.utsumi_price,
				product.my_company_code
			];

			results = execute(update_sql, args);
		}


		// Save History

		args = [
			staff_uuid, 
			product.my_company_code,
			action,
			previous,
			JSON.stringify(product)
		];

		results = execute(history_sql, args);

	}

	return res.json({
		msg: 'okay'
	});

});

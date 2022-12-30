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

const C100 = (function() {

	this.MEM = {
		tmpData : [],
		userData : [],
		new_flag : false
	}

	this.DOM = {
		tbody : document.getElementById('C100.tbody'),
		table : {
			add : document.getElementById('C100.table.add'),
			thead : document.getElementById('C100.table.thead'),
			tbody : document.getElementById('C100.table.tbody'),
			csv : document.getElementById('C100.table.csv'),
			seller_name : document.getElementById('C100.table.seller_name'),
			buyer_name_1 : document.getElementById('C100.table.buyer_name_1'),
			buyer_name_2 : document.getElementById('C100.table.buyer_name_2'),
			buyer_name_3 : document.getElementById('C100.table.buyer_name_3'),
			unit_string_1 : document.getElementById('C100.unit.string_1'),
			unit_string_2 : document.getElementById('C100.unit.string_2'),
			unit_string_3 : document.getElementById('C100.unit.string_3'),
		},
		file : {
			space : document.getElementById('C100.file.space'),
			input : document.getElementById('C100.file.input')
		},
		history : {
			body : document.getElementById('C100.history.body')
		}
	}

	this.EVT = {
		handleWindowMessage : evt_handleWindowMessage.bind(this),
		handleProductAddClick : evt_handleProductAddClick.bind(this),

		handleSpanEditClick : evt_handleSpanEditClick.bind(this),
		handleSpanCancelClick : evt_handleSpanCancelClick.bind(this),
		handleSpanSaveClick : evt_handleSpanSaveClick.bind(this),
		handleSpanRemoveClick : evt_handleSpanRemoveClick.bind(this),

		handleCsvClick : evt_handleCsvClick.bind(this),

		handleDropAreaClick : evt_handleDropAreaClick.bind(this),
		handleFileDragEnter : evt_handleFileDragEnter.bind(this),
		handleFileDragLeave : evt_handleFileDragLeave.bind(this),
		handleFileDragOver : evt_handleFileDragOver.bind(this),
		handleFileDragDrop :  evt_handleFileDragDrop.bind(this),
		handleFileChange : evt_handleFileChange.bind(this),
		handleHistoryClick : evt_handleHistoryClick.bind(this)
	}

	this.API = {
		addNewProduct	: api_addNewProduct.bind(this),
		selectProducts	: api_selectProducts.bind(this),
		readCsvFile	: api_readCsvFile.bind(this),
		readFileAsync	: api_readFileAsync.bind(this),
		updateNumberLines : api_updateNumberLines.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		window.addEventListener("message", this.EVT.handleWindowMessage);
		this.DOM.table.add.addEventListener('click', this.EVT.handleProductAddClick);
		this.DOM.table.csv.addEventListener('click', this.EVT.handleCsvClick);

		this.DOM.file.space.addEventListener('click', this.EVT.handleDropAreaClick);

		this.DOM.file.space.addEventListener('drop', this.EVT.handleFileDragDrop);
		this.DOM.file.space.addEventListener('dragover', this.EVT.handleFileDragOver);
		this.DOM.file.space.addEventListener('dragleave', this.EVT.handleFileDragLeave);
		this.DOM.file.space.addEventListener('dragenter', this.EVT.handleFileDragEnter);
		this.DOM.file.input.addEventListener('input', this.EVT.handleFileChange);

		setTimeout(function () {
			let elm = document.getElementById('C100.main');
			elm.style.visibility = "visible";
		},1000);

		this.DOM.table.seller_name.textContent = "林製紙";
		this.DOM.table.buyer_name_1.textContent = "内海";
		this.DOM.table.unit_string_1.textContent = "単品価格";
/*
		this.DOM.table.buyer_name_2.textContent = "";
		this.DOM.table.buyer_name_3.textContent = "";
		this.DOM.table.unit_string_2.textContent = "ケース価格";
		this.DOM.table.unit_string_3.textContent = "ケース価格";
*/
	}

	function evt_handleCsvClick() {
		
		this.DOM.file.input.click();

	}

	async function evt_handleHistoryClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		if(this.MEM.activeRow) {
			this.MEM.activeRow.classList.remove("active");
		}

		this.MEM.activeRow = userData.row;
		this.MEM.activeRow.classList.add("active");

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				my_company_code:userData.data.my_company_code
			})
		}

		let data;
		let res;
		try {
			res = await fetch('/utsumi/getProductHistory', params);
			data = await res.json();
		} catch(err) {
			throw err;
		}

		this.DOM.history.body.innerHTML = "";

		if( data.length == 0) {
			return;
		}

		let keys = {
			"utsumi_price" : "内海値段",
			"jyanpure_price" : "ジャンブレ値段",
			"forest_price" : "フォレスト値段"
		}

		data.forEach( change => {

			let hasChange = false;
			let date;

			if(typeof change.logged_on === 'string') {
				date = new Date(change.logged_on);
			} else {
				date = change.logged_on;
			}
			let year = date.getFullYear();
			let month = date.getMonth()+1;
			let day = date.getDate();

			const li = document.createElement("li");
			const span = document.createElement("span");
			span.textContent = "Date: " + year + "-" + month + "-" + day;
			li.appendChild(span);


			const table = document.createElement("table");
			const thead = document.createElement("thead");
			const tbody = document.createElement("tbody");
			table.appendChild(thead);
			table.appendChild(tbody);

			const tr = document.createElement("tr");
			const th_a = document.createElement("th");
			const th_b = document.createElement("th");
			const th_c = document.createElement("th");
			const th_d = document.createElement("th");

			th_a.setAttribute("class", "a");
			th_b.setAttribute("class", "b");
			th_c.setAttribute("class", "c");
			th_d.setAttribute("class", "d");

			th_a.textContent = "Value";
			th_b.textContent = "Old";
			th_d.textContent = "New";

			tr.appendChild(th_a);
			tr.appendChild(th_b);
			tr.appendChild(th_c);
			tr.appendChild(th_d);
			thead.appendChild(tr);
			table.appendChild(thead);
			li.appendChild(table);
			
			let o = change.old_value || {};
			let n = change.new_value || {};

			for(let key in keys) {
				
				if(o[key] === n[key]) {
					continue;
				}
				
				if(key != "utsumi_price") {
					continue;
				}
					
				hasChange = true;
				const row = tbody.insertRow();

				const a = row.insertCell();
				const b = row.insertCell();
				const c = row.insertCell();
				const d = row.insertCell();
				
				a.setAttribute("class", "a");
				b.setAttribute("class", "b");
				c.setAttribute("class", "c");
				d.setAttribute("class", "d");

				a.textContent = keys[key];
				b.textContent = o[key];
				c.textContent = "→";
				d.textContent = n[key];
				
				let a_num = parseFloat(o[key]);
				let b_num = parseFloat(n[key]);

				if((parseFloat(o[key]) || 0) < parseFloat(n[key])) {
					c.classList.add("up");
				} else {
					c.classList.add("down");
				}

			}

			if(!hasChange) {
				return;
			}

			this.DOM.history.body.appendChild(li);

		});

	}

	function api_updateNumberLines() {

		let num = 0;

		for(let i = 0; i < this.DOM.table.thead.rows.length; i++) {
			
			num++;
			let row = this.DOM.table.thead.rows[i];
			let cell = row.cells[0];
			
			let str = num.toString();
			while(str.length < 3) {
				str = "0" + str;
			}

			cell.textContent = str;

		}

		for(let i = 0; i < this.DOM.table.tbody.rows.length; i++) {
			
			num++;
			let row = this.DOM.table.tbody.rows[i];
			let cell = row.cells[0];
			
			let str = num.toString();
			while(str.length < 3) {
				str = "0" + str;
			}

			cell.textContent = str;

		}

	}

	function evt_handleFileChange(evt) {

		let files = evt.target.files;
		if(!files || !files.length) {
			return;
		}
		
		this.API.readCsvFile(files);

	}

	function evt_handleFileDragEnter(evt) {

		evt.stopPropagation();
		evt.preventDefault();

		this.DOM.file.space.classList.add("jam");

	}

	function evt_handleFileDragLeave(evt) {

		evt.stopPropagation();
		evt.preventDefault();

		this.DOM.file.space.classList.remove("jam");

	}

	function evt_handleFileDragOver(evt) {

		evt.stopPropagation();
		evt.preventDefault();


	}

	function evt_handleFileDragDrop(evt) {

		evt.stopPropagation();
		evt.preventDefault();

		this.DOM.file.space.classList.remove("jam");
		let files = evt.dataTransfer.files;
		this.API.readCsvFile(files);

	}

	function evt_handleDropAreaClick() {

		this.DOM.file.input.click();

	}


	async function api_selectProducts() {

		this.MEM.new_flag = false;
		
		let data;

		try {
			data = await fetch('/utsumi/selectProducts', {method: 'POST'});
			data = await data.json();
		} catch(err) {
			throw err;
		}

		this.DOM.table.tbody.innerHTML = "";

		for(let i = 0; i < data.length; i++) {
			this.API.addNewProduct(data[i]);
		}

		this.API.updateNumberLines();

	}

	function evt_handleSpanEditClick(evt) {


		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.inputs[1].removeAttribute("readonly");
		userData.inputs[2].removeAttribute("readonly");
		userData.inputs[3].removeAttribute("readonly");
		userData.inputs[4].removeAttribute("readonly");
		userData.inputs[5].removeAttribute("readonly");
		userData.inputs[6].removeAttribute("readonly");

		userData.spans[0].setAttribute("class", "disabled");
		userData.spans[1].removeAttribute("class");
		userData.spans[2].removeAttribute("class");
		userData.spans[3].removeAttribute("class");

		userData.inputs[0].focus();

	}

	function evt_handleSpanCancelClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let data = userData.data || {};
		userData.inputs[0].value = data.my_company_code;
		userData.inputs[1].value = data.utsumi_code;
		userData.inputs[2].value = data.product_name;
		userData.inputs[3].value = data.utsumi_price;
		userData.inputs[4].value = data.jyanpure_price;
		userData.inputs[5].value = data.forest_price;
		userData.inputs[6].value = data.case_count;

		userData.inputs.forEach( input => {
			input.setAttribute("readonly", "readonly");
		});

		// Update Span Disabled

		userData.spans[0].removeAttribute("class");
		userData.spans[1].setAttribute("class", "disabled");
		userData.spans[2].setAttribute("class", "disabled");
		userData.spans[3].setAttribute("class", "disabled");

		this.DOM.table.thead.innerHTML = "";

		this.API.selectProducts();
	}

	async function evt_handleSpanSaveClick(evt) {


		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		// Get the user Data

		let data = userData.data || {};
		data.my_company_code	= userData.inputs[0].value;
		data.utsumi_code	= userData.inputs[1].value;
		data.product_name	= userData.inputs[2].value;
		data.utsumi_price	= userData.inputs[3].value;
		data.jyanpure_price	= userData.inputs[4].value;
		data.forest_price	= userData.inputs[5].value;
		data.case_count		= userData.inputs[6].value;

		const params = {
			method : 'POST',
			headers : {
				'Content-Type': 'application/json'
			},
			body : JSON.stringify(data)
		}

		if(this.MEM.userData.indexOf(userData) === -1) {
			
			let result;
			let req;

			try {
				req = await fetch('/utsumi/insertProduct', params);
				result = await req.json();
			} catch(err) {
				throw err;
			}
			
			if(result == -1) {
				alert("Code already exists in database");
				return;
			}

			this.MEM.userData.push(userData);
			let str = data.my_company_code.toString();

			let added = false;
			let rows = this.DOM.table.tbody.rows;
			for(let i = 0; i < rows.length; i++) {
				let dat = rows[i].userData;
				let code = dat.data.my_company_code;
				if(str.localeCompare(code) > 0) {
					continue;
				}
				
				this.DOM.table.tbody.insertBefore(userData.row, dat.row);
				added = true;
				break;
			}

			if(!added) {
				this.DOM.table.tbody.appendChild(userData.row);
			}

		} else {
			
			let result;
			let req;

			try {

				req = await fetch('/utsumi/updateProduct', params);
				result = await req.json();

			} catch(err) {
				throw err;
			}

		}

		// Update Span Disabled

		userData.spans[0].removeAttribute("class");
		userData.spans[1].setAttribute("class", "disabled");
		userData.spans[2].setAttribute("class", "disabled");
		userData.spans[3].setAttribute("class", "disabled");

		// Set Inputs disabled

		userData.inputs.forEach( input => {
			input.setAttribute("readonly", "readonly");
		});

	}

	async function evt_handleSpanRemoveClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let bool = confirm("この商品を削除しますか？");
		if(!bool) {
			return;
		}

		let index = this.MEM.userData.indexOf(userData);

		let row = userData.row;
		row.parentNode.removeChild(row);

		if(index === -1) {
			return;
		}

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				my_company_code:userData.data.my_company_code
			})
		}

		let result;
		let req;

		try {
			req = await fetch('/utsumi/removeProduct', params);

			result = await req.json();
		} catch(err) {
			throw err;
		}

	}

	function evt_handleWindowMessage(evt) {

		switch(evt.data.code) {
		case "init":
			setTimeout(function () {
				this.API.selectProducts();
			}.bind(this), 1000);
			break;
		}

	}

	function evt_handleProductAddClick() {

		this.MEM.new_flag = true;

		this.DOM.tbody.scroll({top: 0, behavior: 'smooth'});

		this.API.addNewProduct();
		this.API.updateNumberLines();

	}

	function api_addNewProduct(data) {

		const row = document.createElement('tr');

		const userData = {};
		row.userData = userData;
		userData.row = row;
		userData.data = data || {};

		// Add Cells

		const cell_0 = row.insertCell();
		const cell_1 = row.insertCell();
		const cell_2 = row.insertCell();
		const cell_3 = row.insertCell();
		const cell_4 = row.insertCell();
		const cell_b = row.insertCell();

		const cell_5 = row.insertCell();
		const cell_6 = row.insertCell();
		const cell_7 = row.insertCell();
		const cell_8 = row.insertCell();
		const cell_9 = row.insertCell();
		const cell_a = row.insertCell();

		cell_0.setAttribute("class", "a");
		cell_1.setAttribute("class", "b");
		cell_2.setAttribute("class", "c");
		cell_3.setAttribute("class", "d");
		cell_4.setAttribute("class", "e");
		cell_5.setAttribute("class", "f");
		cell_6.setAttribute("class", "g");
		cell_7.setAttribute("class", "h");
		cell_8.setAttribute("class", "i");
		cell_9.setAttribute("class", "i");
		cell_a.setAttribute("class", "i");
		cell_b.setAttribute("class", "e");

		cell_0.textContent = "000";
		cell_0.addEventListener('click', this.EVT.handleHistoryClick);
		cell_0.userData = userData;

		// Add Inputs

		userData.inputs = [];

		const input_0 = document.createElement("input");
		const input_1 = document.createElement("input");
		const input_2 = document.createElement("input");
		const input_3 = document.createElement("input");
		const input_4 = document.createElement("input");
		const input_5 = document.createElement("input");
		const input_6 = document.createElement("input");

		input_0.setAttribute("type", "text");
		input_1.setAttribute("type", "text");
		input_2.setAttribute("type", "text");
		input_3.setAttribute("type", "text");
		input_4.setAttribute("type", "text");
		input_5.setAttribute("type", "text");
		input_6.setAttribute("type", "text");

		input_0.setAttribute("placeholder", "商品コード(自社)");
		input_1.setAttribute("placeholder", "商品コード(内海)");
		input_2.setAttribute("placeholder", "商品名");
		input_3.setAttribute("placeholder", "00.00");
		input_4.setAttribute("placeholder", "00.00");
		input_5.setAttribute("placeholder", "00.00");
		input_6.setAttribute("placeholder", "入数");

		cell_1.appendChild(input_0);
		cell_2.appendChild(input_1);
		cell_3.appendChild(input_2);
		cell_4.appendChild(input_3);
		cell_5.appendChild(input_4);
		cell_6.appendChild(input_5);
		cell_b.appendChild(input_6);

		userData.inputs.push(input_0);
		userData.inputs.push(input_1);
		userData.inputs.push(input_2);
		userData.inputs.push(input_3);
		userData.inputs.push(input_4);
		userData.inputs.push(input_5);
		userData.inputs.push(input_6);

		if(data) {
			input_0.value = data.my_company_code;
			input_1.value = data.utsumi_code;
			input_2.value = data.product_name;
			input_3.value = data.utsumi_price;
			input_4.value = data.jyanpure_price;
			input_5.value = data.forest_price;
			input_6.value = data.case_count || '';

			input_0.setAttribute("readonly", "readonly");
			input_1.setAttribute("readonly", "readonly");
			input_2.setAttribute("readonly", "readonly");
			input_3.setAttribute("readonly", "readonly");
			input_4.setAttribute("readonly", "readonly");
			input_5.setAttribute("readonly", "readonly");
			input_6.setAttribute("readonly", "readonly");
		}

		// Add Spans

		userData.spans = [];

		const span_0 = document.createElement("span");
		const span_1 = document.createElement("span");
		const span_2 = document.createElement("span");
		const span_3 = document.createElement("span");

		span_0.textContent = "Edit";
		span_1.textContent = "Cancel";
		span_2.textContent = "Save";
		span_3.textContent = "Remove";

		span_0.addEventListener('click', this.EVT.handleSpanEditClick);
		span_1.addEventListener('click', this.EVT.handleSpanCancelClick);
		span_2.addEventListener('click', this.EVT.handleSpanSaveClick);
		span_3.addEventListener('click', this.EVT.handleSpanRemoveClick);
		
		span_0.userData = userData;
		span_1.userData = userData;
		span_2.userData = userData;
		span_3.userData = userData;

		userData.spans.push(span_0);
		userData.spans.push(span_1);
		userData.spans.push(span_2);
		userData.spans.push(span_3);

		if(!data) {
			span_0.setAttribute("class", "disabled");

			if(this.MEM.new_flag == true) {
				span_3.setAttribute("class", "disabled");
			} else {
				span_1.setAttribute("class", "disabled");
			}

		} else {
			span_1.setAttribute("class", "disabled");
			span_2.setAttribute("class", "disabled");
			span_3.setAttribute("class", "disabled");
		}

		cell_7.appendChild(span_0);
		cell_8.appendChild(span_1);
		cell_9.appendChild(span_2);
		cell_a.appendChild(span_3);
		
		if(!data) {
			this.DOM.table.thead.appendChild(row);
		} else {
			this.DOM.table.tbody.appendChild(row);
			this.MEM.userData.push(userData);
		}

	}


	async function api_readCsvFile(files) {

		const batchData = [];

		for(let i = 0; i < files.length; i++) {
			
			let file = files[i];

			let text;
			try {
				text = await this.API.readFileAsync(file);
			} catch(err) {
				throw err;
			}

			let lines = text.split("\r\n");
			lines.forEach( line => {
				
				let parts = line.split(",");
				batchData.push({
					my_company_code	: parts[0],
					utsumi_code	: parts[1],
					product_name	: parts[2],
					utsumi_price	: parts[3],
					jyanpure_price	: parts[4],
					forest_price	: parts[5]
				});

			});

		}
		
		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				"batchData": batchData
			})
		}

		let data;
		let req;

		try {
			req = await fetch('/utsumi/updateProduct', params);

			data = await req.json();

		} catch(err) {
			throw err;
		}
		
		this.API.selectProducts();

	}

	function api_readFileAsync(file) {

		return new Promise( (resolve, reject) => {
			
			const reader = new FileReader();

			reader.onload = (evt) => {
				resolve(evt.target.result);
			}

			reader.onerror = (evt) => {
				reader.abort();
				reject();
			}

			reader.readAsText(file)
		});

	}



}).apply(this);

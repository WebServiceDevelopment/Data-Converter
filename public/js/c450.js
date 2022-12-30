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

const C450 = (function() {

	this.MEM = {
		tmpData : [],
		userData : [],
		selectData : [],
		new_flag : false
	}

	this.DOM = {
		tbody : document.getElementById('C450.tbody'),
		table : {
			file : document.getElementById('C450.table.file'),
			add_all : document.getElementById('C450.table.add_all'),
			add_one : document.getElementById('C450.table.add_one'),
			thead : document.getElementById('C450.table.thead'),
			tbody : document.getElementById('C450.table.tbody'),
			seller_name_1 : document.getElementById('C450.table.seller_name_1'),
			seller_name_2 : document.getElementById('C450.table.seller_name_2'),
			buyer_name_1 : document.getElementById('C450.table.buyer_name_1'),
			buyer_name_2 : document.getElementById('C450.table.buyer_name_2'),
		},
		file : {
			space : document.getElementById('C450.file.space'),
			input : document.getElementById('C450.file.input')
		},
		history : {
			body : document.getElementById('C450.history.body')
		}
	}

	this.EVT = {
		handleFileChange : evt_handleFileChange.bind(this),
		handleWindowMessage : evt_handleWindowMessage.bind(this),

		handleProductAddAllClick : evt_handleProductAddAllClick.bind(this),
		handleProductAddOneClick : evt_handleProductAddOneClick.bind(this),

		handleSpanEditClick : evt_handleSpanEditClick.bind(this),
		handleSpanCancelClick : evt_handleSpanCancelClick.bind(this),
		handleSpanSaveClick : evt_handleSpanSaveClick.bind(this),
		handleSpanRemoveClick : evt_handleSpanRemoveClick.bind(this),

		handleDropAreaClick : evt_handleDropAreaClick.bind(this),
		handleFileDragEnter : evt_handleFileDragEnter.bind(this),
		handleFileDragLeave : evt_handleFileDragLeave.bind(this),
		handleFileDragOver : evt_handleFileDragOver.bind(this),
		handleFileDragDrop :  evt_handleFileDragDrop.bind(this)

		//handleHistoryClick : evt_handleHistoryClick.bind(this)
	}

	this.API = {
		addNewProduct : api_addNewProduct.bind(this),
		selectProducts : api_selectProducts.bind(this),
		updateNumberLines : api_updateNumberLines.bind(this),
		readCsvFile : api_readCsvFile.bind(this),
		csvToJson : api_csvToJson.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		window.addEventListener("message", this.EVT.handleWindowMessage);

		this.DOM.table.add_all.addEventListener('click', this.EVT.handleProductAddAllClick);
		this.DOM.table.add_one.addEventListener('click', this.EVT.handleProductAddOneClick);

		this.DOM.file.space.addEventListener('click', this.EVT.handleDropAreaClick);

		this.DOM.file.space.addEventListener('drop', this.EVT.handleFileDragDrop);
		this.DOM.file.space.addEventListener('dragover', this.EVT.handleFileDragOver);
		this.DOM.file.space.addEventListener('dragleave', this.EVT.handleFileDragLeave);
		this.DOM.file.space.addEventListener('dragenter', this.EVT.handleFileDragEnter);
		this.DOM.file.input.addEventListener('input', this.EVT.handleFileChange);

		this.DOM.table.file.addEventListener('change', this.EVT.handleFileChange);


		setTimeout(function () {
			let elm = document.getElementById('C450.main');
			elm.style.visibility = "visible";
		},1000);

		this.DOM.table.seller_name_1.textContent ="林製紙";
		this.DOM.table.seller_name_2.textContent ="林製紙";
		this.DOM.table.buyer_name_1.textContent ="ジャンブレ";
		this.DOM.table.buyer_name_2.textContent ="ジャンブレ";
	}

	async function evt_handleFileChange(evt) {

		let files = evt.target.files;
		if(!files.length) {
			return;
		}

		let file = files[0];

		let arrayBuffer;
		try {
			arrayBuffer = await this.API.readCsvFile(file);
		} catch(err) {
			throw err;
		}

		const args = {
			to	: 'UNICODE',
			from	: 'UTF8',
			type	: 'string'
		};

		let utf8Array = new Uint8Array(arrayBuffer);
		let detected = Encoding.detect(utf8Array);

		args.from = detected;
		let unicodeString = Encoding.convert(utf8Array, args);
		let batchData = this.API.csvToJson(unicodeString);

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
 			},
			body : JSON.stringify({
 				"batchData": batchData
 			})
		}

		let result;
		let req;

		try {
			req = await fetch('/janbure/batchUpdate', params);
			result = await req.json();

		} catch(err) {
			throw err;
		}

		this.API.selectProducts();

	}

	function api_readCsvFile(file) {

		return new Promise( (resolve, reject) => {

			let reader = new FileReader();


			reader.onload = evt => {
				resolve(evt.target.result);
			}

			reader.readAsArrayBuffer(file)

		});

	}

	function api_csvToJson(str) {

		let lines = str.split('\n');
		
		let onlyNumbers = new RegExp('^[0-9]*$');

		let csv = [];
		for(let i = 0; i < lines.length; i++) {
			
			lines[i] = lines[i].replace('\r', '');
			let row = lines[i].split(',');
			if(!row.length) {
				continue;
			}

			if(!onlyNumbers.test(row[0])) {
				continue;
			}

			if(row[0].length === 0) {
				continue;
			}

			csv.push({
				jyanbure_code	: row[0],
				jyanbure_name	: row[1],
				my_company_code	: row[2],
				my_company_name	: row[3],
				inner_count	: row[4],
				last_price0	: row[5],
				last_price1	: row[6]
			});

		}

		return csv;

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
		let req;

		try {
			req = await fetch('/janbure/selectProducts', {method:'POST'});
			data = await req.json();
		} catch(err) {
			throw err;
		}


		this.DOM.table.thead.innerHTML = "";
		this.DOM.table.tbody.innerHTML = "";
		this.MEM.selectData = [];
		
		for(let i = 0; i < data.length; i++) {
			this.API.addNewProduct(data[i]);
			this.MEM.selectData[i] = data[i];
		}

		this.API.updateNumberLines();

	}

	function evt_handleSpanEditClick(evt) {


		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.inputs[2].removeAttribute("readonly");
		userData.inputs[3].removeAttribute("readonly");
		userData.inputs[4].removeAttribute("readonly");
		userData.inputs[5].removeAttribute("readonly");
		userData.inputs[6].removeAttribute("readonly");

		userData.spans[0].setAttribute("class", "disabled");
		userData.spans[1].removeAttribute("class");
		userData.spans[2].removeAttribute("class");
		userData.spans[3].removeAttribute("class");

		userData.inputs[2].focus();

	}

	function evt_handleSpanCancelClick(evt) {


		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let data = userData.data || {};
		userData.inputs[2].value = data.jyanbure_name;
		userData.inputs[3].value = data.my_company_name;
		userData.inputs[4].value = data.inner_count;
		userData.inputs[5].value = data.last_price0;
		userData.inputs[6].value = data.last_price1;

		userData.inputs.forEach( input => {
			input.setAttribute("readonly", "readonly");
		});

		// Update Span Disabled

		userData.spans[0].removeAttribute("class");
		userData.spans[1].setAttribute("class", "disabled");
		userData.spans[2].setAttribute("class", "disabled");
		userData.spans[3].setAttribute("class", "disabled");

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
		data.jyanbure_code	= userData.inputs[0].value;
		data.my_company_code	= userData.inputs[1].value;
		data.jyanbure_name	= userData.inputs[2].value;
		data.my_company_name	= userData.inputs[3].value;
		data.inner_count	= userData.inputs[4].value;
		data.last_price0	= userData.inputs[5].value;
		data.last_price1	= userData.inputs[6].value;

		if(data.jyanbure_code == "") {
			let msg="商品コードが入力されていません";
			alert(msg);

			return;
		}
		if(data.my_company_code == "") {
			let msg="商品コードが入力されていません";
			alert(msg);

			return;
		}

		if(this.MEM.new_flag == true) {
			if(checkJyanbureCode(this.MEM.selectData, data.jyanbure_code)) {
				let msg="商品コードが重複しています";
				alert(msg);
	
				return;
			}
			if(checkHayashiCode(this.MEM.selectData, data.my_company_code)) {
				let msg="商品コードが重複しています";
				alert(msg);
	
				return;
			}
		}

                const params = {
                        method : 'POST',
                        headers : {
                                'Content-Type': 'application/json'
                        },
                        body : JSON.stringify(data)
                }

		let result;
		let req;
	
		try {

			req = await fetch('/janbure/updateProduct', params);

			result = await req.json();

		} catch(err) {
			throw err;
		}
		if( result.msg == -1) {
			let msg = "商品コードが重複しています.";
			alert(msg);

			this.API.selectProducts();

			return;
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

		this.API.selectProducts();

		return;

		function checkJyanbureCode(data, jyanbure_code) {
			for(let i =0; i< data.length; i++) {
				//console.log(data[i].jyanbure_code +":"+ jyanbure_code)
				if(data[i].jyanbure_code == jyanbure_code) {
					return true;
				}
			}
			return false;
		}

		function checkHayashiCode(data, my_company_code) {
			for(let i =0; i< data.length; i++) {
				//console.log(data[i].my_company_code +":"+ my_company_code)
				if(data[i].my_company_code == my_company_code) {
					return true;
				}
			}
			return false;
		}

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
		if(index === -1) {
			return;
		}

		let row = userData.row;
		row.parentNode.removeChild(row);
		this.MEM.userData.splice(index, 1);

		// Get the user Data

		let data = userData.data || {};
		data.jyanbure_code = userData.inputs[0].value;
		data.my_company_code = userData.inputs[1].value;

                const params = {
                        method : 'POST',
                        headers : {
                                'Content-Type': 'application/json'
                        },
                        body : JSON.stringify(data)
                }


		let result;
		let req;
		try {

			req = await fetch('/janbure/removeProduct', params);

			result = await req.json();

		} catch(err) {
			throw err;
		}
		
		this.API.updateNumberLines();

		this.API.selectProducts();

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

	function evt_handleProductAddAllClick() {

		this.DOM.table.file.click();

		console.log("add All click!!!");
		
		/*
		this.API.addNewProduct();
		this.API.updateNumberLines();
		*/

	}

	function evt_handleProductAddOneClick() {

		//this.DOM.table.file.click();

		console.log("add One click!!!");

		
		this.MEM.new_flag = true;

		this.API.addNewProduct();
		this.API.updateNumberLines();

		this.DOM.tbody.scroll({top: 0, behavior: 'smooth'});
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
		const cell_5 = row.insertCell();
		const cell_6 = row.insertCell();
		const cell_7 = row.insertCell();
		const cell_8 = row.insertCell();
		const cell_9 = row.insertCell();
		const cell_a = row.insertCell();
		const cell_b = row.insertCell();

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
		cell_b.setAttribute("class", "i");

		cell_0.textContent = "000";
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

		cell_1.appendChild(input_0);
		cell_2.appendChild(input_1);
		cell_3.appendChild(input_2);
		cell_4.appendChild(input_3);
		cell_5.appendChild(input_4);
		cell_6.appendChild(input_5);
		cell_7.appendChild(input_6);

		userData.inputs.push(input_0);
		userData.inputs.push(input_1);
		userData.inputs.push(input_2);
		userData.inputs.push(input_3);
		userData.inputs.push(input_4);
		userData.inputs.push(input_5);
		userData.inputs.push(input_6);

		if(data) {
			input_0.value = data.jyanbure_code;
			input_1.value = data.my_company_code;
			input_2.value = data.jyanbure_name;
			input_3.value = data.my_company_name;
			input_4.value = data.inner_count;
			input_5.value = data.last_price0;
			input_6.value = data.last_price1;

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

		cell_8.appendChild(span_0);
		cell_9.appendChild(span_1);
		cell_a.appendChild(span_2);
		cell_b.appendChild(span_3);
		
		if(!data) {
			this.DOM.table.thead.appendChild(row);
		} else {
			this.DOM.table.tbody.appendChild(row);
			this.MEM.userData.push(userData);
		}

	}



}).apply(this);

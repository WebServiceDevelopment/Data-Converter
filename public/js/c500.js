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

const C500 = (function() {

	this.MEM = {}

	this.DOM = {
		form : {
			modal : document.getElementById('C500.form.modal'),
			close : document.getElementById('C500.form.close'),
			jyanbure_code : document.getElementById('C500.form.jyanbure_code'),
			jyanbure_name : document.getElementById('C500.form.jyanbure_name'),
			my_company_code : document.getElementById('C500.form.my_company_code'),
			my_company_name : document.getElementById('C500.form.my_company_name'),
			inner_count : document.getElementById('C500.form.inner_count'),
			last_price0 : document.getElementById('C500.form.last_price0'),
			last_price1 : document.getElementById('C500.form.last_price1'),
			cancel : document.getElementById('C500.form.cancel'),
			submit : document.getElementById('C500.form.submit')
		},
		csv : {
			area : document.getElementById('C500.csv.area'),
			preview : document.getElementById('C500.csv.preview')
		},
		output : {
			textarea : document.getElementById('C500.output.textarea'),
			fmt_send : document.getElementById('C500.output.fmt_send'),
			fmt_wsd : document.getElementById('C500.output.fmt_wsd'),
			sjis : document.getElementById('C500.output.sjis'),
			utf8 : document.getElementById('C500.output.utf8'),
			yes_comments : document.getElementById('C500.output.yes_comments'),
			no_comments : document.getElementById('C500.output.no_comments'),
			filename : document.getElementById('C500.output.filename'),
			fixed : document.getElementById('C500.output.fixed'),
			submit : document.getElementById('C500.output.submit'),
			clear : document.getElementById('C500.output.clear'),
			prepayment : document.getElementById('C500.output.prepayment'),
			cash_on_delivery : document.getElementById('C500.output.cash_on_delivery'),
			all : document.getElementById('C500.output.all')
		},
		history : {
			select : document.getElementById('C500.history.select'),
			input : document.getElementById('C500.history.input'),
			search : document.getElementById('C500.history.search'),
			reset : document.getElementById('C500.history.reset'),
			back : document.getElementById('C500.history.back'),
			list : document.getElementById('C500.history.list')
		}
	}

	this.EVT = {
		handleCsvDrop : evt_handleCsvDrop.bind(this),
		handleCsvDragEnter : evt_handleCsvDragEnter.bind(this),
		handleCsvDragLeave : evt_handleCsvDragLeave.bind(this),
		handleCsvDragOver : evt_handleCsvDragOver.bind(this),
		handleCustomerClick : evt_handleCustomerClick.bind(this),
		handleRecipientClick : evt_handleRecipientClick.bind(this),
		handleBackClick : evt_handleBackClick.bind(this),
		handleSearchClick : evt_handleSearchClick.bind(this),
		handleCheckChange : evt_handleCheckChange.bind(this),
		handleRadioChange : evt_handleRadioChange.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleClearClick : evt_handleClearClick.bind(this),
		handlePriceRadioChange : evt_handlePriceRadioChange.bind(this),
		handlePriceInputClick : evt_handlePriceInputClick.bind(this),
		handleQuantityChange : evt_handleQuantityChange.bind(this),
		handleInputChange : evt_handleInputChange.bind(this),
		handleMasterClick : evt_handleMasterClick.bind(this),
		handleModalClose : evt_handleModalClose.bind(this),
		handleModalCancel : evt_handleModalCancel.bind(this),
		handleModalSubmit : evt_handleModalSubmit.bind(this),
		handleFixedClick : evt_handleFixedClick.bind(this)
	}

	this.API = {
		readCsvFiles : api_readCsvFiles.bind(this),
		readFileBinary : api_readFileBinary.bind(this),
		processCsv : api_processCsv.bind(this),
		renderOrders : api_renderOrders.bind(this),
		createTopRow : api_createTopRow.bind(this),
		createShipping : api_createShipping.bind(this),
		createProducts : api_createProducts.bind(this),
		createWarehouse : api_createWarehouse.bind(this),
		renderOutput : api_renderOutput.bind(this),
		createSendFormat : api_createSendFormat.bind(this),
		createSendFormatFix : api_createSendFormatFix.bind(this),
		createWsdFormat : api_createWsdFormat.bind(this),
		implementSearch : api_implementSearch.bind(this),
		resetCheckList : api_resetCheckList.bind(this),
		displayFixes : api_displayFixes.bind(this),
		renderHistoryItem : api_renderHistoryItem.bind(this),
		renderHistoryHeader : api_renderHistoryHeader.bind(this),
		renderHistoryCustomer : api_renderHistoryCustomer.bind(this),
		renderHistoryRecipient : api_renderHistoryRecipient.bind(this),
		renderHistoryAmount : api_renderHistoryAmount.bind(this),
		renderHistoryDetails : api_renderHistoryDetails.bind(this),
		renderHistoryFooter : api_renderHistoryFooter.bind(this),
		numFullToHalf : api_numFullToHalf.bind(this),
		numHalfToFullB : api_numHalfToFullB.bind(this),
		updateAllTotalValues : api_updateAllTotalValues.bind(this),
		createInputs : api_createInputs.bind(this),
		createProducts2 : api_createProducts2.bind(this),
		checkInputs : api_checkInputs.bind(this),
		clearModalForm : api_clearModalForm.bind(this),
		closeModalForm : api_closeModalForm.bind(this),
		storeIpfs : api_storeIpfs.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.DOM.csv.area.addEventListener('drop', this.EVT.handleCsvDrop);
		this.DOM.csv.area.addEventListener('dragenter', this.EVT.handleCsvDragEnter);
		this.DOM.csv.area.addEventListener('dragleave', this.EVT.handleCsvDragLeave);
		this.DOM.csv.area.addEventListener('dragover', this.EVT.handleCsvDragOver);
		this.DOM.history.back.addEventListener('click', this.EVT.handleBackClick);
		this.DOM.history.search.addEventListener('click', this.EVT.handleSearchClick);

		this.DOM.output.sjis.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.utf8.addEventListener('change', this.EVT.handleRadioChange);
		
		this.DOM.output.prepayment.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.cash_on_delivery.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.all.addEventListener('change', this.EVT.handleRadioChange);

		/*
		this.DOM.output.yes_comments.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.no_comments.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.fmt_send.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.fmt_wsd.addEventListener('change', this.EVT.handleRadioChange);
		*/
	
		this.DOM.output.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.output.clear.addEventListener('click', this.EVT.handleClearClick);

		this.DOM.form.close.addEventListener('click', this.EVT.handleModalClose);
		this.DOM.form.cancel.addEventListener('click', this.EVT.handleModalCancel);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleModalSubmit);

		this.API.clearModalForm();
		
		this.DOM.output.fixed.addEventListener('click', this.EVT.handleFixedClick);
		this.DOM.output.submit.setAttribute('disabled', 'disabled');
		this.DOM.output.fixed.setAttribute('disabled', 'disabled');
		

		setTimeout(function () {
			let elm = document.getElementById('C500.main');
			elm.style.visibility = "visible";
		},1000);
	}

	async function evt_handleFixedClick() {

		const SKIP_KEYS = [ 'order_uuid' ];

		const clonedOrders = [];
		this.MEM.userData.forEach ( (userData) => {
			const clonedOrder = {
				checked : userData.checkbox.checked
			}
			for(let key in userData.order) {
				if(SKIP_KEYS.indexOf(key) !== -1) {
					continue;
				}
				clonedOrder[key] = userData.order[key];
			}
			clonedOrders.push(clonedOrder);
		});

		const params = {
			method : 'POST',
			headers: { 
				'Content-Type': 'application/json',
			},
			body : JSON.stringify(clonedOrders)
		}

		const req = await fetch('/janbure/processed_data', params);
		const res = await req.json();
		this.DOM.output.submit.removeAttribute('disabled');

	}

	async function evt_handleModalSubmit() {

		let cell, row, errors;
		errors = 0;

		const Params = {
			jyanbure_code : this.DOM.form.jyanbure_code.value,
			jyanbure_name : this.DOM.form.jyanbure_name.value,
			my_company_code : this.DOM.form.my_company_code.value,
			my_company_name : this.DOM.form.my_company_name.value,
			inner_count : this.DOM.form.inner_count.value,
			last_price0 : this.DOM.form.last_price0.value,
			last_price1 : this.DOM.form.last_price1.value 
		}
		
		// Jyanbure Code

		cell = this.DOM.form.jyanbure_code.parentNode;
		row = cell.parentNode;

		if(Params.jyanbure_code.replace(/\s/g,'').length === 0) {
			row.classList.add('error');
			errors++;
		} else {
			row.classList.remove('error');
		}
		
		// Jyanbure Name

		cell = this.DOM.form.jyanbure_name.parentNode;
		row = cell.parentNode;

		if(Params.jyanbure_name.replace(/\s/g,'').length === 0) {
			row.classList.add('error');
			errors++;
		} else {
			row.classList.remove('error');
		}
		
		// Hayashi Code

		cell = this.DOM.form.my_company_code.parentNode;
		row = cell.parentNode;

		if(Params.my_company_code.replace(/\s/g,'').length === 0) {
			row.classList.add('error');
			errors++;
		} else {
			row.classList.remove('error');
		}

		// Hayashi Name

		cell = this.DOM.form.my_company_name.parentNode;
		row = cell.parentNode;

		if(Params.my_company_name.replace(/\s/g,'').length === 0) {
			row.classList.add('error');
			errors++;
		} else {
			row.classList.remove('error');
		}

		// Inner Count

		cell = this.DOM.form.inner_count.parentNode;
		row = cell.parentNode;

		if(Params.inner_count.replace(/\s/g,'').length === 0) {
			row.classList.add('error');
			errors++;
		} else if(!/^\d+$/.test(Params.inner_count)) {
			row.classList.add('error');
			errors++;
		} else {
			row.classList.remove('error');
		}
		
		// If we have errors, then we stop execution

		if(errors) {
			return;
		}

		let jyanbure_code = this.DOM.form.jyanbure_code.value;
		let jyanbure_name = this.DOM.form.jyanbure_name.value;
		let my_company_code = this.DOM.form.my_company_code.value;
		let my_company_name = this.DOM.form.my_company_name.value;
		let inner_count = this.DOM.form.inner_count.value;
		let last_price0 = this.DOM.form.last_price0.value;
		let last_price1 = this.DOM.form.last_price1.value; 

		const params = {
			method : 'POST',
			headers: { 
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				jyanbure_code,
				jyanbure_name,
				my_company_code,
				my_company_name,
				inner_count,
				last_price0,
				last_price1
			})
				
		}

		let result;
		let res;

		try {
			const req = await fetch('/janbure/registerProduct', params);
			result = await req.json();
		} catch(err) {
			throw err;
		}

		if(result.err === 1) {

			cell = this.DOM.form.my_company_code.parentNode;
			row = cell.parentNode;
			row.classList.add('error');
			let h = this.DOM.form.my_company_code.value;

			alert([
				`林コード「${h}」は既に登録されています。`,
				"確認はジャンブレ商品タブで出来ます。"
			].join("\n"));
			return;

		} else if(result.err === 2) {

			alert("Unknown Error: Please contact system admin");
			return;

		}

		// Call table page to refresh contents

		let message = {
			code : 'refresh',
			args : 'c450'
		};

		window.parent.postMessage(message, '*');

		this.API.closeModalForm();
		this.API.clearModalForm();

		let p = Params;
		this.MEM.products[p.jyanbure_code] = p;

		let processed = this.MEM.processed;

		// Go through userdata to find which onces are checked
		// and which ones are not.

		this.MEM.history = [];
		this.MEM.userData.forEach( userData => {
			this.MEM.history.push(userData.checkbox.checked);
		});

		// Re-Render the final information

		this.API.renderOrders(processed);
		this.API.renderOutput();
		delete this.MEM.history;

	}

	function api_closeModalForm() {

		this.DOM.form.modal.classList.remove('open');

	}

	function api_clearModalForm() {

		this.DOM.form.jyanbure_code.value = '';
		this.DOM.form.jyanbure_name.value = '';
		this.DOM.form.my_company_code.value = '';
		this.DOM.form.my_company_name.value = '';
		this.DOM.form.inner_count.value = '';
		this.DOM.form.last_price0.value = '0';
		this.DOM.form.last_price1.value = '0';

		let cell, row;

		// Jyanbure Code

		cell = this.DOM.form.jyanbure_code.parentNode;
		row = cell.parentNode;
		row.classList.remove('error');
		
		// Jyanbure Name

		cell = this.DOM.form.jyanbure_name.parentNode;
		row = cell.parentNode;
		row.classList.remove('error');
		
		// Hayashi Code

		cell = this.DOM.form.my_company_code.parentNode;
		row = cell.parentNode;
		row.classList.remove('error');

		// Hayashi Name

		cell = this.DOM.form.my_company_name.parentNode;
		row = cell.parentNode;
		row.classList.remove('error');

		// Inner Count

		cell = this.DOM.form.inner_count.parentNode;
		row = cell.parentNode;
		row.classList.remove('error');

	}

	function evt_handleModalClose() {

		this.API.closeModalForm();
		this.API.clearModalForm();

	}

	function evt_handleModalCancel() {

		this.API.closeModalForm();
		this.API.clearModalForm();

	}

	function evt_handleMasterClick(evt) {

		let elem = evt.target;
		let data = elem.userData;
	
		this.DOM.form.jyanbure_code.value = data.product_code;
		this.DOM.form.jyanbure_name.value = data.product_name;
		this.DOM.form.my_company_code.value = data.supplier_item_number;
		
		this.DOM.form.modal.classList.add('open');

		if(data.supplier_item_number.length === 0) {
			this.DOM.form.my_company_code.focus();
		} else {
			this.DOM.form.my_company_name.focus();
		}

	}

	function api_checkInputs(inputs, doCheck) {

		let dateStr = inputs.b.value;
		let year = dateStr.substr(0, 4);
		let month = dateStr.substr(4, 2);
		let day = dateStr.substr(6, 2);

		if(doCheck === 'b') {
			let dd = moment([year, month, day].join('-'));
			dd.add(1, 'days');
			inputs.a.value = dd.format('yyMMDD');
		}

		let cell_a = inputs.a.parentNode.parentNode;
		let cell_b = inputs.b.parentNode.parentNode;

		let warn_a = false;
		let warn_b = false;

		// Check 1 if 納期 is same day or before 出荷予定日
		
		const a = parseInt(inputs.a.value);
		const b = parseInt(inputs.b.value);

		if(a <= b) {
			warn_a = true;
			cell_a.classList.add('warn');
		} else {
			cell_a.classList.remove('warn');
		}

		// Check 2 if 納期 is earlier than tomorrow

		let today = parseInt(moment().format('yyMMDD'));

		if(b <= today) {
			warn_b = true;
			cell_b.classList.add('warn');
		} else {
			cell_b.classList.remove('warn');
		}

		// Then we see if we need to apply the same dates
		// to the rest of the inputs
		
		if(doCheck === 'a') {
			return;
		}

		if(this.MEM.dateInputs.indexOf(inputs) !== 0) {
			return;
		}

		if(this.MEM.dateInputs.length <= 1) {
			return;
		}
		
		setTimeout( () => {

			let bool = confirm([
				'全注文日を以下通り設定しますか？',
				`「出荷予定日」${inputs.b.value}`,
				`「納期」${inputs.a.value}`
			].join('\n'));

			if(!bool) {
				return;
			}

			this.MEM.dateInputs.forEach( ipt => {

				cell_a = ipt.a.parentNode.parentNode;
				cell_b = ipt.b.parentNode.parentNode;
				
				ipt.a.value = inputs.a.value;
				ipt.b.value = inputs.b.value;
	
				if(warn_a) {
					cell_a.classList.add('warn');
				} else {
					cell_a.classList.remove('warn');
				}

				if(warn_b) {
					cell_b.classList.add('warn');
				} else {
					cell_b.classList.remove('warn');
				}
	
			});

			this.API.renderOutput();

		}, 300);

	}

	function evt_handleInputChange(evt) {

		this.API.renderOutput();

	}

	function evt_handleQuantityChange(evt) {

		let elem = evt.target;
		let localData = elem.localData;
		localData.case_quantity = elem.value;
		this.API.renderOutput();

	}

	function api_updateAllTotalValues() {

		this.MEM.userData.forEach( userData => {
			
			let sum = 0;
			
			let order = userData.order;
			let details = order.details;

			details.forEach( detail => {
				sum += detail.order_amount;
			});

			userData.totals.subtotal.value = sum;
			userData.totals.total.value = sum;

			order.order_amount = sum;
			order.total_order_amount = sum;

		});

	}

	function evt_handlePriceInputClick(evt) {

		const elem = evt.target;
		const radio = elem.previousSibling;
		radio.click();

	}

	function evt_handlePriceRadioChange(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		let index = userData.radio.indexOf(elem);
		let price = parseInt(userData.price[index]);

		userData.radio[0].parentNode.parentNode.classList.remove("warn");
		userData.radio[1].parentNode.parentNode.classList.remove("warn");

		userData.radio[0].parentNode.parentNode.classList.add("edit");
		userData.radio[1].parentNode.parentNode.classList.add("edit");

		let count = userData.data.order_quantity;
		let subtotal = price * count;
		userData.input.value = subtotal;
		userData.data.unit_price = price;
		userData.data.order_amount = subtotal;
		this.API.updateAllTotalValues();
		this.API.renderOutput();

	}

	function evt_handleClearClick() {

		this.DOM.history.list.innerHTML = "";
		this.DOM.output.textarea.value = "";
		this.DOM.output.filename.value = "";
		this.DOM.csv.preview.innerHTML = "";
		delete this.MEM.userData;
		
		this.DOM.output.submit.setAttribute('disabled', 'disabled');
		this.DOM.output.fixed.setAttribute('disabled', 'disabled');

	}

	async function evt_handleSubmitClick() {
	
		if(this.DOM.output.textarea.value.length === 0) {
			return;
		}

		if(!this.MEM.userData) {
			return;
		}

		const keyword = this.DOM.output.textarea.value;
		const orders = [];
		this.MEM.userData.forEach( userData => {
			
			const order = userData.order;
			order.checked = userData.checkbox.checked ? 1 : 0;
			let str = JSON.stringify(order);
			let o = JSON.parse(str);
			orders.push(order);

		});
		

		if(this.DOM.output.sjis.checked) {

			const unicodeArray = [];
			for (let i = 0; i < keyword.length; i++) {
				unicodeArray.push(keyword.charCodeAt(i));
			}

			const sjisArray = Encoding.convert(unicodeArray, {
				to: 'SJIS',
				from: 'UNICODE',
			});

			let buffer = new Uint8Array(sjisArray);
			let blob = new Blob([ buffer ] , {type: "text/csv"});
			saveAs(blob, this.DOM.output.filename.value);


		} else {

			let blob = new Blob([ keyword ] , {type: "text/csv"});
			saveAs(blob, this.DOM.output.filename.value);

		}
	
	}

	function evt_handleRadioChange() {

		this.API.renderOutput(true);

	}

	function evt_handleCheckChange() {

		this.API.renderOutput();

	}

	function api_renderHistoryItem(order) {

		const li = document.createElement("li");

		const meta = this.API.renderHistoryHeader(order);
		li.appendChild(meta);

		const a = this.API.renderHistoryCustomer(order);
		li.appendChild(a);

		const b = this.API.renderHistoryRecipient(order);
		li.appendChild(b);

		const c = this.API.renderHistoryAmount(order);
		li.appendChild(c);

		const d = this.API.renderHistoryDetails(order);
		li.appendChild(d);

		const e = this.API.renderHistoryFooter(order);
		li.appendChild(e);

		return li;

	}

	function api_renderHistoryFooter(order) {

		const footer = document.createElement("div");
		footer.setAttribute("class", "footer");

		const div = document.createElement("div");
		div.setAttribute("class", "row");

		const table = document.createElement("table");

		const row_1 = table.insertRow();
		const row_2 = table.insertRow();
		const row_3 = table.insertRow();
		const row_4 = table.insertRow();
		const row_5 = table.insertRow();
		const row_6 = table.insertRow();

		const cell_0 = row_1.insertCell();
		const cell_1 = row_1.insertCell();

		const cell_2 = row_2.insertCell();
		const cell_3 = row_2.insertCell();

		const cell_4 = row_3.insertCell();
		const cell_5 = row_3.insertCell();

		const cell_6 = row_4.insertCell();
		const cell_7 = row_4.insertCell();

		const cell_8 = row_5.insertCell();
		const cell_9 = row_5.insertCell();

		const cell_a = row_6.insertCell();
		const cell_b = row_6.insertCell();

		cell_0.setAttribute("class", "label b");
		cell_2.setAttribute("class", "label b");
		cell_4.setAttribute("class", "label b");
		cell_6.setAttribute("class", "label b");
		cell_8.setAttribute("class", "label b");
		cell_a.setAttribute("class", "label b");

		cell_0.textContent = "受注番号";
		cell_2.textContent = "倉庫：加工業者名称";
		cell_4.textContent = "倉庫：加工業者郵便番号";
		cell_6.textContent = "倉庫：加工業者住所";
		cell_8.textContent = "倉庫：加工業者電話番号";
		cell_a.textContent = "倉庫：加工業者FAX番号";

		cell_1.setAttribute("class", "value");
		cell_3.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");
		cell_7.setAttribute("class", "value");
		cell_9.setAttribute("class", "value");
		cell_b.setAttribute("class", "value");

		cell_1.textContent = order.order_number;
		cell_3.textContent = order.warehouse.processor_name;
		cell_5.textContent = order.warehouse.processor_postcode;
		cell_7.textContent = order.warehouse.processor_address;
		cell_9.textContent = order.warehouse.processor_tel;
		cell_b.textContent = order.warehouse.processor_fax;

		div.appendChild(table);
		footer.appendChild(div);

		return footer;

	}

	function api_renderHistoryDetails(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "table");

		const table = document.createElement("table");
		table.setAttribute('border', '1');

		// Thead

		const thead = document.createElement("thead");
		const hrow = thead.insertRow();

		const th_a = document.createElement("th");
		const th_b = document.createElement("th");
		const th_c = document.createElement("th");
		const th_d = document.createElement("th");
		const th_e = document.createElement("th");

		th_a.setAttribute("class", "label a");
		th_b.setAttribute("class", "label b");
		th_c.setAttribute("class", "label c");
		th_d.setAttribute("class", "label d");
		th_e.setAttribute("class", "label e");

		th_a.textContent = "商品ｺｰﾄﾞ";
		th_b.textContent = "商品名";
		th_c.textContent = "数量";
		th_d.textContent = "単価";
		th_e.textContent = "金額";
		
		hrow.appendChild(th_a);
		hrow.appendChild(th_b);
		hrow.appendChild(th_c);
		hrow.appendChild(th_d);
		hrow.appendChild(th_e);

		table.appendChild(thead);

		// Tbody

		const tbody = document.createElement("tbody");

		order.details.forEach( detail => {
			
			const row = tbody.insertRow();

			const cell_0 = row.insertCell();
			const cell_1 = row.insertCell();
			const cell_2 = row.insertCell();
			const cell_3 = row.insertCell();
			const cell_4 = row.insertCell();

			cell_0.textContent = detail.product_code;
			cell_1.textContent = detail.product_name;
			cell_2.textContent = detail.order_quantity;
			cell_3.textContent = parseInt(detail.unit_price || detail.ordering_unit);
			cell_4.textContent = detail.order_amount;

		});

		table.appendChild(tbody);

		// Return
		
		div.appendChild(table);
		return div;

	}

	function api_renderHistoryAmount(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "table");

		const table = document.createElement("table");
		table.setAttribute("border", "1");

		const row_a = table.insertRow();
		const row_b = table.insertRow();
		const row_c = table.insertRow();
		const row_d = table.insertRow();

		// Labels

		const cell_0 = row_a.insertCell();
		const cell_1 = row_b.insertCell();
		const cell_2 = row_c.insertCell();
		const cell_3 = row_d.insertCell();

		cell_0.setAttribute("class", "label");
		cell_1.setAttribute("class", "label");
		cell_2.setAttribute("class", "label");
		cell_3.setAttribute("class", "label");

		cell_0.textContent = "代引区分";
		cell_1.textContent = "発注金額";
		cell_2.textContent = "消費税";
		//cell_3.textContent = "発注金額合計";
		cell_3.textContent = "金額合計";

		// Values

		const cell_4 = row_a.insertCell();
		const cell_5 = row_b.insertCell();
		const cell_6 = row_c.insertCell();
		const cell_7 = row_d.insertCell();

		cell_4.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");
		cell_6.setAttribute("class", "value");
		cell_7.setAttribute("class", "value");

		cell_5.setAttribute("colspan", "3");
		cell_6.setAttribute("colspan", "3");
		cell_7.setAttribute("colspan", "3");

		cell_4.textContent = order.cash_on_delivery_division;
		cell_5.textContent = order.order_amount;
		cell_6.textContent = order.consumption_tax;
		cell_7.textContent = order.total_order_amount;

		// Pay on Delivery

		const cell_8 = row_a.insertCell();
		const cell_9 = row_a.insertCell();

		cell_8.setAttribute("class", "label");
		cell_8.textContent = "代引金額";

		cell_9.setAttribute("class", "value");
		cell_9.textContent = order.cash_on_delivery_amount;

		// Return

		div.appendChild(table);
		return div;

	}

	function api_renderHistoryRecipient(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "table");

		const table = document.createElement("table");
		table.setAttribute("border", "1");

		const row_a = table.insertRow();
		const row_b = table.insertRow();
		const row_c = table.insertRow();
		const row_d = table.insertRow();

		// Labels

		const cell = row_a.insertCell();
		cell.setAttribute("class", "label_left");
		cell.setAttribute("rowspan", 4);
		cell.innerHTML = "お<br>届<br>け<br>先";

		const cell_0 = row_a.insertCell();
		const cell_1 = row_b.insertCell();
		const cell_2 = row_c.insertCell();
		const cell_3 = row_d.insertCell();

		cell_0.setAttribute("class", "label");
		cell_1.setAttribute("class", "label");
		cell_2.setAttribute("class", "label");
		cell_3.setAttribute("class", "label");

		cell_0.textContent = "名称";
		cell_1.textContent = "郵便番号";
		cell_2.textContent = "住所";
		cell_3.textContent = "電話番号";

		// Values

		const cell_4 = row_a.insertCell();
		const cell_5 = row_b.insertCell();
		const cell_6 = row_c.insertCell();
		const cell_7 = row_d.insertCell();

		cell_4.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");
		cell_6.setAttribute("class", "value");
		cell_7.setAttribute("class", "value");

		cell_4.textContent = order.recipient.name;
		cell_5.textContent = order.recipient.post;
		cell_6.textContent = order.recipient.addr;
		cell_7.textContent = order.recipient.tel;

		// Return

		div.appendChild(table);
		return div;

	}

	function api_renderHistoryCustomer(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "table");

		const table = document.createElement("table");
		table.setAttribute("border", "1");

		const row_a = table.insertRow();
		const row_b = table.insertRow();
		const row_c = table.insertRow();
		const row_d = table.insertRow();

		// Labels

		const cell = row_a.insertCell();
		cell.setAttribute("class", "label_left");
		cell.setAttribute("rowspan", 4);
		cell.innerHTML = "依<br>頼<br>主";

		const cell_0 = row_a.insertCell();
		const cell_1 = row_b.insertCell();
		const cell_2 = row_c.insertCell();
		const cell_3 = row_d.insertCell();

		cell_0.setAttribute("class", "label");
		cell_1.setAttribute("class", "label");
		cell_2.setAttribute("class", "label");
		cell_3.setAttribute("class", "label");

		cell_0.textContent = "名称";
		cell_1.textContent = "郵便番号";
		cell_2.textContent = "住所";
		cell_3.textContent = "電話番号";

		// Values

		const cell_4 = row_a.insertCell();
		const cell_5 = row_b.insertCell();
		const cell_6 = row_c.insertCell();
		const cell_7 = row_d.insertCell();

		cell_4.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");
		cell_6.setAttribute("class", "value");
		cell_7.setAttribute("class", "value");

		cell_4.textContent = order.customer.name;
		cell_5.textContent = order.customer.post;
		cell_6.textContent = order.customer.addr;
		cell_7.textContent = order.customer.tel;

		// Return

		div.appendChild(table);
		return div;

	}

	function api_renderHistoryHeader(order) {
		
		const meta = document.createElement("div");
		meta.setAttribute('class', 'meta');

		// First row

		const div1 = document.createElement('div');
		div1.setAttribute("class", "row");

		const tbl1 = document.createElement("table");
		const row1_1 = tbl1.insertRow();
		const row1_2 = tbl1.insertRow();
		const row1_3 = tbl1.insertRow();

		const cell_0 = row1_1.insertCell();
		const cell_1 = row1_1.insertCell();
		const cell_2 = row1_2.insertCell();
		const cell_3 = row1_2.insertCell();
		const cell_4 = row1_3.insertCell();
		const cell_5 = row1_3.insertCell();
		
		cell_0.setAttribute('class', 'label a');
		cell_1.setAttribute('class', 'value a');
		cell_2.setAttribute('class', 'label b');
		cell_3.setAttribute('class', 'value b');
		cell_4.setAttribute('class', 'label c');
		cell_5.setAttribute('class', 'value c');

		let d ;
		if(typeof order.order_date === 'string') {
			d = new Date(order.order_date);
		} else {
			d = order.order_date;
		}

		let y = d.getFullYear();

		let m = d.getMonth().toString();
		if(m.length < 2) {
			m = "0" + m;
		}

		let h = d.getDate().toString();
		if(h.length < 2) {
			h = "0" + h;
		}

		cell_0.textContent = "注文No.";
		cell_1.textContent = order.order_no;
		cell_2.textContent = "注文日:";
		cell_3.textContent = [y, m, h].join("-");
		cell_4.textContent = "送り先区分:";
		cell_5.textContent = order.destination_division;

		div1.appendChild(tbl1);
		meta.appendChild(div1);
		
		// Second Row

		const div2 = document.createElement('div');
		div2.setAttribute("class", "row pad");

		const tbl2 = document.createElement("table");
		const row2_1 = tbl2.insertRow();
		const row2_2 = tbl2.insertRow();

		const cell_6 = row2_1.insertCell();
		const cell_7 = row2_1.insertCell();
		const cell_8 = row2_2.insertCell();
		const cell_9 = row2_2.insertCell();
		
		cell_6.setAttribute('class', 'label e');
		cell_7.setAttribute('class', 'value e');
		cell_8.setAttribute('class', 'label f');
		cell_9.setAttribute('class', 'value f');

		cell_6.textContent = "依頼主顧客コード:";
		cell_7.textContent = order.customer.id;
		cell_8.textContent = "お届け先コード:";
		cell_9.textContent = order.recipient.id;

		div2.appendChild(tbl2);
		meta.appendChild(div2);

		// Third Row

		const div3 = document.createElement('div');
		div3.setAttribute("class", "row pad");

		const tbl3 = document.createElement("table");
		const row3 = tbl3.insertRow();

		const cell_a = row3.insertCell();
		const cell_b = row3.insertCell();
		
		cell_a.setAttribute('class', 'label g');
		cell_b.setAttribute('class', 'value g');

		cell_a.textContent = "お届け先所属・担当者名:";
		cell_b.textContent = order.contact

		div2.appendChild(tbl3);
		meta.appendChild(div3);

		// Return
	
		return meta;

	}

	function evt_handleSearchClick() {

		if(this.DOM.history.input.length === 0) {
			return;
		}

		this.API.implementSearch();

	}

	function evt_handleBackClick() {
	
		this.DOM.history.input.value = "";
		this.DOM.history.list.innerHTML = "";
		this.API.resetCheckList();

	}

	function api_resetCheckList() {

		const array = this.MEM.userData || [];
		array.forEach( userData => {
			userData.li.removeAttribute("style");
		});
		
		this.DOM.history.reset.classList.add("hide");

	}

	function api_displayFixes() {

		console.log("display the fixes!!!");

	}

	async function api_implementSearch() {

		// Reset all of the checkbox elements

		this.API.resetCheckList();

		// Check if we are searching for a 'Fix'

		if(this.DOM.history.input.value.indexOf("Fix:") === 0) {
			this.API.displayFixes();
			return;
		}

		// Step 1 : Exclude

		const exclude = [];
		const array = this.MEM.userData || [];
		array.forEach( userData => {
			exclude.push(userData.order.order_uuid);
		});

		let search_term = this.DOM.history.select.value;
		let search_key = this.DOM.history.input.value;

		// Step 2 : Show in-browser results

		array.forEach( userData => {

			let src;

			switch(search_term) {
			case "order_no":
				src = userData.order.order_no;
				break;
			case "order_number":
				src = userData.order.order_number;
				break;
			case "customer_no":
				src = userData.order.customer.id;
				break;
			case "recipient_no":
				src = userData.order.recipient.id;
				break;
			}

			if(src != search_key) {
				userData.li.style.display = "none";
				return;
			}

			userData.li.removeAttribute("style");
		});

		this.DOM.history.reset.classList.remove("hide");
		this.DOM.history.list.innerHTML = "";

		// Step 3 Fetch Results from Database

		const params = {
			method : 'POST',
			headers: { 
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				search_term,
				search_key,
  				exclude
			})
		}

		let data;
		let req;

		try {
			const req = await fetch('/janbure/searchOrders', params);
			data = await req.json();
		} catch(err) {
			throw err;
		}

		if(!data || data == []) {
			return;
		}

		data.forEach( order => {
			let li = this.API.renderHistoryItem(order);
			this.DOM.history.list.appendChild(li);
		});

	}

	function evt_handleCustomerClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		let order = userData.order;
		this.DOM.history.select.value = "customer_no";
		this.DOM.history.input.value = order.customer.id;
		this.API.implementSearch();

	}

	function evt_handleRecipientClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		let order = userData.order;
		this.DOM.history.select.value = "recipient_no";
		this.DOM.history.input.value = order.recipient.id;
		this.API.implementSearch();

	}

	function api_renderOutput(skipDisableSubmit) {
		
		if(!this.MEM.userData) {
			return;
		}
		
		if(!skipDisableSubmit) {
			this.DOM.output.submit.setAttribute('disabled', 'disabled');
		}

		this.API.createSendFormatFix();
		
		/*
		if(this.DOM.output.fmt_send.checked) {
			// this.API.createSendFormat();
			
			// console.log("do the fixx!!!");
			this.API.createSendFormatFix();

		} else if(this.DOM.output.fmt_wsd.checked) {
			this.API.createWsdFormat();
		}
		*/

	}

	function api_createSendFormatFix() {
			
		const records = [];
		
		/*
		if(this.DOM.output.yes_comments.checked) {
			records.push([
				"#A",
				"B",
				"C",
				"D",
				"E",
				"F",
				"G",
				"H",
				"I",
				"J",
				"K",
				"L",
				"M",
				"N",
				"O",
				"P",
				"Q",
				"R",
				"S",
				"T",
				"U",
				"V",
				"W",
				"X",
				"Y",
				"Z",
				"AA",
				"AB",
				"AC",
				"AD",
				"AE",
				"AF",
				"AG",
				"AH",
				"AI",
				"AJ",
				"AK",
				"AL",
				"AM",
				"AN",
				"AO",
				"AP",
				"AQ",
				"AR",
				"AS",
				"AT",
				"AU",
				"AV",
				"AW",
				"AX",
				"AY"
			].join(","))
		}
		*/

		this.MEM.userData.forEach( userData => {

			if(!userData.checkbox.checked) {
				return;
			}

			const order = userData.order;
			let index = 0;

			let isCash = parseInt(order.cash_on_delivery_division);

			if(this.DOM.output.prepayment.checked && isCash) {
				userData.li.classList.remove('active');
				return;
			} else if(this.DOM.output.cash_on_delivery.checked && !isCash) {
				userData.li.classList.remove('active');
				return;
			} else {
				userData.li.classList.remove('active');
			}
			
			if(!this.DOM.output.all.checked) {
				userData.li.classList.add('active');
			}

			order.details.forEach( detail => {

				let product = this.MEM.products[detail.product_code] || {};

				const row = [];

				// A

				row.push(userData.inputs['得意先コード'].value);

				// B

				row.push('');

				// C
				// Q1. [C] 空文字でよろしいですか？
				// 000000

				row.push('000000');

				// D

				row.push('');

				// E

				row.push(userData.inputs['納品先コード'].value);

				// F
				// [F] 「ジャンブレ」それとも空額がよろしいでしょうか？
				// ジャンブレ

				row.push('ジャンブレ');

				// G

				row.push('');

				// H

				row.push('');

				// I

				row.push('');

				// J

				row.push(userData.inputs['ルートコード'].value);

				// K

				// row.push(order.order_no);
				// Destination slip 
				//row.push(detail.destination_slip);
				row.push('');

				// L

				//row.push(order.shipment_confirmation_date.replace(/\//g, ''));
				row.push(userData.inputs['納期'].value);

				// M
			
				/*
				index++;
				let str = index.toString();
				while(str.length < 3) {
					str = '0' + str;
				}
				row.push(str);
				*/

				row.push('');

				// N
				
				let code = product.my_company_code || '';
				while(code.length < 5) {
					code = '0' + code;
				}

				row.push(code);

				// O

				row.push(product.my_company_name || '');

				// P

				row.push('');

				// Q

				row.push(product.inner_count || "");

				// R

				row.push(detail.order_quantity);

				// S

				let count = "";
				let price = "";

				if(product.inner_count) {
					let a = parseInt(detail.order_quantity);
					let b = parseInt(product.inner_count);
					let c = a * b;
					count = c;

					let d = parseInt(detail.order_amount);
					let e = (d / c).toFixed(2)
					price = e;
				}

				row.push(count);

				// T

				row.push(price);

				// U

				row.push(detail.order_amount);

				// V

				row.push('');

				// W

				row.push('');

				// X

				row.push('');

				// Y

				row.push('');

				// Z

				row.push('');

				// AA

				row.push('');

				// AB

				row.push('');

				// AC

				row.push('');

				// AD

				row.push('');

				// AE

				row.push('');

				// AF

				row.push('');

				// AG

				row.push('');

				// AH

				row.push('');
				// AI

				row.push('');

				// AJ

				row.push('');

				// AK

				row.push('');

				// AL

				row.push('');

				// AM

				row.push('');

				// AN

				row.push('');

				// AO

				row.push('');

				// AP

				row.push('');

				// AQ

				row.push('');

				// AR

				row.push('');

				// AS

				row.push('');

				// AT

				row.push('');

				// AU

				row.push('');

				// AV

				row.push('');

				// AW

				// row.push(order.supply.name);
				row.push('');

				// AX

				// row.push(order.delivery_date.replace(/\//g, ''));
				row.push(userData.inputs['出荷予定日'].value);

				// AY

				row.push(order.order_no);

				// End

				records.push(row.join(","));


			});

		});
		
		this.DOM.output.textarea.value = records.join("\r\n");

	}

	function api_createSendFormat() {

		let str = "";
		const records = [];
		let num = 1000;

		if(this.DOM.output.yes_comments.checked) {
			records.push("# Comment Placeholder");
		}

		this.MEM.userData.forEach( userData => {
			
			if(!userData.checkbox.checked) {
				return;
			}

			const order = userData.order;
			const row = [];

			// Position 00 << INDEX >>

			row.push(num++);

			// Position 01 Unknown

			row.push("");

			// Position 02 Unknown

			row.push("");

			// Position 03 Unknown

			row.push("");

			// Position 04 Unknown

			row.push("");

			// Position 05 << 注文日付 ? >>

			row.push(order.order_date);

			// Position 06 Unknown

			row.push("");

			// Position 07 Unknown

			row.push("");

			// Position 08  << 整理番号? >>

			row.push("");

			// Position 09 Unknown

			row.push("");

			// Position 10 Unknown

			row.push("");

			// Position 11 Unknown

			row.push("");

			// Position 12 Unknown

			row.push("");

			// Position 13 Unknown

			row.push("");

			// Position 14 Unknown

			row.push("");

			// Position 15 << 得意先No. >>

			row.push(order.customer.id);

			// Position 16 Unknown

			row.push("");

			// Position 17 << 注文数 / 届け先 ? >>

			let product_count = order.details.length.toString();
			if(product_count.length < 2) {
				product_count = "0" + product_count;
			}

			row.push( product_count + "01" );

			// Position 18 Unknown

			row.push("");

			// Position 19 Unknown

			row.push("");

			// Position 20 Unknown

			row.push("");

			// Position 21 Unknown

			row.push("");

			// Position 22 << 届け先TEL (unformated) >>

			row.push(order.recipient.tel);

			// Position 23 Unknown

			row.push("");

			// Position 24 << 届け先TEL (formated) >>

			row.push(getFormatPhone(order.recipient.tel) || "");

			// Position 25 << 届け先名 (30文字) >>

			let recipient_name = order.recipient.name;
			while(recipient_name.length < 30) {
				recipient_name += " ";
			}

			row.push(recipient_name);

			// Position 26 << 届け先住所 (51文字) >>

			let recipient_addr = order.recipient.addr;
			while(recipient_addr.length < 51) {
				recipient_addr += " ";
			}

			row.push(recipient_addr);

			// Position 27 Unknown

			row.push("");

			// Position 28 Unknown

			row.push("");

			// Position 29 Unknown

			row.push("");

			// Position 30 << 出荷 TEL (formatted) >>

			row.push(getFormatPhone(order.customer.tel));

			// Position 31

			row.push(" ");

			// Position 32  << 出荷名 >>

			let shipper_name = order.customer.name;
			while(shipper_name.length < 35) {
				shipper_name += " ";
			}

			// Position 33 << 「発注番号」>>

			row.push("発注番号");

			// Position 34 - 43

			for(let k = 0; k < 5; k++) {
				if(!order.details[k]) {
					row.push(" ");
					row.push(" ");
					continue;
				}

				row.push(order.details[k].product_name);
				row.push(order.details[k].case_quantity);
			}

			// Positions 44 - 53

			for(let k = 0; k < 10; k++) {
				row.push("");
			}

			// Position 54

			row.push("A");

			// Complete records

			records.push(row.join(","));

		});
		
		this.DOM.output.textarea.value = records.join("\r\n");

	}

	function api_createWsdFormat() {

		let str = "";
		const records = [];

		if(this.DOM.output.yes_comments.checked) {

			records.push([
				"# START",
				"INDEX",
				"DETAIL_COUNT"
			].join(","));

			records.push([
				"# 注文No.",
				"受注番号",
				"注文日",
				"仕入先コード",
				"仕入先名称"
			].join(","));

			records.push([
				"# 依頼主顧客コード",
				"依頼主名称",
				"依頼主郵便番号",
				"依頼主住所",
				"依頼主電話番号"
			].join(","));

			records.push([
				"# お届け先コード",
				"お届け先名称",
				"お届け先郵便番号",
				"お届け先住所",
				"お届け先電話番",
				"送り先区分",
				"お届け先所属・担当者名"
			].join(","));

			records.push([
				"# 代引金額",
				"発注金額",
				"消費税",
				"発注金額合計",
				"代引区分"
			].join(","));

			records.push([
				"# 発注明細番号",
				"商品コード",
				"取引先商品番号",
				"品名",
				"加工有無区分",
				"カラー",
				"サイズ",
				"数量単位",
				"発注単価",
				"発注数量",
				"発注金額",
				"納期日付",
				"希望納期日付",
				"コメント",
				"受注番号",
				"受注明細番号"
			].join(","));

			records.push([
				"# 倉庫：加工業者名称",
				"倉庫：加工業者郵便番号",
				"倉庫：加工業者住所",
				"倉庫：加工業者電話番号",
				"倉庫：加工業者FAX番号"
			].join(","));

			records.push([
				"# END",
				"INDEX",
				"DETAIL_COUNT"
			].join(","));

			records.push("");

		}
		
		let index = -1;
		this.MEM.userData.forEach( userData => {
			
			if(!userData.checkbox.checked) {
				return;
			}

			const order = userData.order;

			index++;
			if(index) {
				records.push("");
			}

			// First Line

			records.push([
				"START",
				index,
				order.details.length
			].join(","));

			// Second Line

			records.push([
				order.order_no,
				order.order_number,
				order.order_date,
				order.supply.id,
				order.supply.name
			].join(","));

			// Third Line

			records.push([
				order.customer.id,
				order.customer.name,
				order.customer.post,
				order.customer.addr,
				order.customer.tel
			].join(","));

			// Fourth Line

			records.push([
				order.recipient.id,
				order.recipient.name,
				order.recipient.post,
				order.recipient.addr,
				order.recipient.tel,
				order.destination_division,
				order.contact
			].join(","));

			// Fifth Line
			
			records.push([
				order.cash_on_delivery_amount,
				order.order_amount,
				order.consumption_tax,
				order.total_order_amount,
				order.cash_on_delivery_division
			].join(","));

			// Sixth Line
			
			for(let i = 0; i < order.details.length; i++) {
				
				let item = order.details[i];

				records.push([
					item.detail_no,
					item.product_code,
					item.supplier_item_number,
					item.product_name,
					item.processing_division,
					item.color,
					item.size,
					item.unit_of_measure,
					item.unit_price,
					item.case_quantity,
					item.order_amount,
					item.delivery_date,
					item.desired_delivery_date,
					item.comment,
					item.order_number,
					item.order_detail_number
				].join(","));

			}

			// Seventh Line

			records.push([
				order.warehouse.processor_name,
				order.warehouse.processor_postcode,
				order.warehouse.processor_address,
				order.warehouse.processor_tel,
				order.warehouse.processor_fax
			].join(","));

			// Eight Line

			records.push([
				"END",
				index,
				order.details.length
			].join(","));

		});
		
		this.DOM.output.textarea.value = records.join("\r\n");

	}

	function evt_handleCsvDrop(evt) {

		evt.stopPropagation();
		evt.preventDefault();
		this.DOM.csv.area.classList.remove("over");

		let files = evt.dataTransfer.files;
		this.API.readCsvFiles(files);

	}

	function evt_handleCsvDragEnter(evt) {

		this.DOM.csv.area.classList.add("over");
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handleCsvDragLeave(evt) {

		this.DOM.csv.area.classList.remove("over");
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handleCsvDragOver(evt) {

		evt.stopPropagation();
		evt.preventDefault();

	}

	async function api_readCsvFiles(files) {

		const headers = [];
		const content = [];

		if(files.length !== 2) {
			return alert('Only two files allowed (header+messai)');
		}

		for(let i = 0; i < files.length; i++) {

			let file = files[i];
			let name = file.name;

			let parts = name.split(".");
			let ext = parts.pop().toLowerCase();
			if(ext !== "csv") {
				continue;
			}

			name = name.replace("header-", "");
			name = name.replace("meisai-", "");
			name = name.replace("header", "");
			name = name.replace("meisai", "");

			this.DOM.output.filename.value = name;

			let buffer;

			try {
				buffer = await this.API.readFileBinary(file);
			} catch(err) {
				throw err;
			}

			let sjisArray = new Uint8Array(buffer);
			let unicodeArray = Encoding.convert(sjisArray, {
				to: 'UNICODE',
				from: 'SJIS'
			});

			let unicodeString = Encoding.codeToString(unicodeArray);
			const lines = unicodeString.split("\r\n");

			let first = lines[0].split(",");

			switch(first.length){
			// Header
			case 27:

				lines.forEach( line => {
					if(!line.length) {
						return;
					}
					headers.push(line);
				});

				break;
			// Content
			case 17:

				lines.forEach( line => {
					if(!line.length) {
						return;
					}
					content.push(line);
				});

				break;
			}

		}

		const params = {
			method : 'POST'
		}
	

		// Start Process Here

		let processed = this.API.processCsv(headers, content);
		let products;
		try {
			const req = await fetch('/janbure/selectProducts', params);
			products = await req.json();
		} catch(err) {
			throw err;
		}
	
		this.DOM.output.fixed.removeAttribute('disabled');

		this.MEM.products = {};
		this.MEM.my_company = {};

		products.forEach(p => {
			this.MEM.products[p.jyanbure_code] = p;
		});

		const myParams = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				list: processed
			})
		}


		let data;
		try {
			data = await fetch('/janbure/insertOrders', myParams);
			data = await data.json();
		} catch(err) {
			throw err;
		}
		
		for(let i = 0; i < data.length; i++) {
			processed[i].order_uuid = data[i];
		}

		// jump c

		// processed.splice(0, 1);

		await this.API.storeIpfs(processed, files);
		this.API.renderOrders(processed);
		this.API.renderOutput();

	}

	async function api_storeIpfs(processed, files) {

		const form = new FormData();
		form.append('data', JSON.stringify(processed));

		for(let i = 0; i < files.length; i++) {
			const file = files[i];

			if(file.name.indexOf('header') !== -1) {
				form.append('header', file);
				continue;
			}

			if(file.name.indexOf('meisai') !== -1) {
				form.append('meisai', file);
				continue;
			}
				
			throw new Error('how did you get here!!?');
		}

		const req = await fetch('/ipfs/set', {
			method : 'POST',
			body : form
		});

		const res = await req.text();

	}

	function api_renderOrders(processed) {

		this.MEM.userData = [];
		this.MEM.dateInputs = [];

		this.DOM.csv.preview.innerHTML = "";
		this.MEM.processed = processed;

		processed.forEach( order => {

			const li = document.createElement("li");

			const userData = {
				li : li,
				order : order
			}
			this.MEM.userData.push(userData);

			let a = this.API.createTopRow(order, userData);
			let b = this.API.createShipping(order, userData);
			
			let c = this.API.createProducts2(order);
			let d = this.API.createWarehouse(order);

			let e = this.API.createInputs(order, userData);

			li.appendChild(a);
			li.appendChild(b);

			li.appendChild(e);

			li.appendChild(c);
			li.appendChild(d);

			this.DOM.csv.preview.appendChild(li);

		});

	}

	function api_createInputs(order, userData) {

		const div = document.createElement('div');
		div.setAttribute('class', 'input-row');

		const table = document.createElement('table');
		const row = table.insertRow();

		const ta_label = row.insertCell();
		const ta_value = row.insertCell();

		const tb_label = row.insertCell();
		const tb_value = row.insertCell();

		const tc_label = row.insertCell();
		const tc_value = row.insertCell();

		const td_label = row.insertCell();
		const td_value = row.insertCell();

		const te_label = row.insertCell();
		const te_value = row.insertCell();

		ta_label.setAttribute('class', 'a label');
		ta_value.setAttribute('class', 'a value');

		tb_label.setAttribute('class', 'b label');
		tb_value.setAttribute('class', 'b value');

		tc_label.setAttribute('class', 'c label');
		tc_value.setAttribute('class', 'c value');

		td_label.setAttribute('class', 'd label');
		td_value.setAttribute('class', 'd value');

		te_label.setAttribute('class', 'e label');
		te_value.setAttribute('class', 'e value');

		ta_label.textContent = '納期';
		tb_label.textContent = '出荷予定日';
		tc_label.textContent = '納品先コード';
		td_label.textContent = 'ルートコード';
		te_label.textContent = '得意先コード';

		// Create Bubble A

		const guide_a = document.createElement('span');
		guide_a.textContent = '?';
		guide_a.setAttribute('class', 'hint a');
		ta_label.appendChild(guide_a);

		const bubble_a = document.createElement('div');
		bubble_a.setAttribute('class', 'bubble');

		const a = document.createElement('a');
		const b = document.createElement('a');

		a.innerHTML = '・「納期」は「出荷予定日」以前であれば黄色になります';
		b.innerHTML = '・「出荷予定日」を変更する場合、「納期」は「出荷予定日」になります';

		bubble_a.appendChild(a);
		bubble_a.appendChild(b);
		guide_a.appendChild(bubble_a);

		// Create Bubble B

		const guide_b = document.createElement('span');
		guide_b.textContent = '?';
		guide_b.setAttribute('class', 'hint b');
		tb_label.appendChild(guide_b);

		const bubble_b = document.createElement('div');
		bubble_b.setAttribute('class', 'bubble');

		const c = document.createElement('a');
		const d = document.createElement('a');

		c.innerHTML = '・「出荷予定日」は本日以前であれば黄色になります';
		d.innerHTML = '・「出荷予定日」を変更する場合、「納期」は「出荷予定日」になります';

		bubble_b.appendChild(c);
		bubble_b.appendChild(d);
		guide_b.appendChild(bubble_b);

		const input_a = document.createElement('input');
		const input_b = document.createElement('input');
		const input_c = document.createElement('input');
		const input_d = document.createElement('input');
		const input_e = document.createElement('input');

		input_a.setAttribute('type', 'text');
		input_b.setAttribute('type', 'text');
		input_c.setAttribute('type', 'text');
		input_d.setAttribute('type', 'text');
		input_e.setAttribute('type', 'text');

		let today = moment();
		let dow = today.day();

		switch(dow) {
		case 5:
			today.add(3, 'days');
			break;
		default:
			today.add(1, 'days');
			break;
		}

		input_b.value = today.format('yyyyMMDD');
		today.add(1, 'days');
		input_a.value = today.format('yyyyMMDD');

		input_c.value = '000000';
		input_d.value = '100';
		input_e.value = '106';

		userData.inputs = {
			"納期" : input_a,
			"出荷予定日" : input_b,
			"納品先コード" : input_c,
			"ルートコード" : input_d,
			"得意先コード" : input_e
		};

		input_a.addEventListener('input', this.EVT.handleInputChange);
		input_b.addEventListener('input', this.EVT.handleInputChange);
		input_c.addEventListener('input', this.EVT.handleInputChange);
		input_d.addEventListener('input', this.EVT.handleInputChange);
		input_e.addEventListener('input', this.EVT.handleInputChange);

		const ipt = {
			a : input_a,
			b : input_b
		}
		
		input_a.userData = ipt;
		input_b.userData = ipt;

		this.MEM.dateInputs.push(ipt);

		$(input_a).datepicker({
			dateFormat : 'yymmdd',
			onSelect : function(inputs) {
				this.API.checkInputs(inputs, 'a');
				this.API.renderOutput()
			}.bind(this, ipt)
		});

		$(input_b).datepicker({
			dateFormat : 'yymmdd',
			onSelect : function(inputs) {
				this.API.checkInputs(inputs, 'b');
				this.API.renderOutput()
			}.bind(this, ipt)
		});

		const div1 = document.createElement('div');
		div1.setAttribute('class', 'cal-hint');
		div1.appendChild(input_a);

		const div2 = document.createElement('div');
		div2.setAttribute('class', 'cal-hint');
		div2.appendChild(input_b);

		ta_value.appendChild(div1);
		tb_value.appendChild(div2);
		tc_value.appendChild(input_c);
		td_value.appendChild(input_d);
		te_value.appendChild(input_e);

		div.appendChild(table);
		return div;

	}

	function api_createTopRow(order, userData) {

		const div = document.createElement("div");
		div.setAttribute("class", "top-row");

		const table = document.createElement("table");
		const row = table.insertRow();

		const label_a = row.insertCell();
		const value_a = row.insertCell();
		const label_b = row.insertCell();
		const value_b = row.insertCell();
		const label_c = row.insertCell();
		const value_c = row.insertCell();
		const label_d = row.insertCell();
		const value_d = row.insertCell();
		const label_e = row.insertCell();
		const value_e = row.insertCell();
		const label_f = row.insertCell();
		const value_f = row.insertCell();
		const fixed = row.insertCell();
		const checked = row.insertCell();

		label_a.setAttribute("class", "label a");
		label_b.setAttribute("class", "label b");
		label_c.setAttribute("class", "label c");
		label_d.setAttribute("class", "label d");
		label_e.setAttribute("class", "label e");
		label_f.setAttribute("class", "label f");
		fixed.setAttribute("class", "fixed");
		checked.setAttribute("class", "checkbox");

		label_a.textContent = "発注番号:";
		label_b.textContent = "注文日:";
		label_c.textContent = "送り先区分:";
		label_d.textContent = "依頼主顧客コード:";
		label_e.textContent = "お届け先コード:";
		label_f.textContent = "お届け先所属・担当者名:";

		value_a.setAttribute("class", "value a");
		value_b.setAttribute("class", "value b");
		value_c.setAttribute("class", "value c");
		value_d.setAttribute("class", "value d");
		value_e.setAttribute("class", "value e");
		value_f.setAttribute("class", "value f");

		const input_a = document.createElement("input");
		const input_b = document.createElement("input");
		const input_c = document.createElement("input");
		const input_d = document.createElement("input");
		const input_e = document.createElement("input");
		const input_f = document.createElement("input");
		const input_g = document.createElement("input");

		input_a.setAttribute("type", "text");
		input_b.setAttribute("type", "text");
		input_c.setAttribute("type", "text");
		input_d.setAttribute("type", "text");
		input_e.setAttribute("type", "text");
		input_f.setAttribute("type", "text");
		input_g.setAttribute("type", "checkbox");
		input_g.checked = true;

		if(this.MEM.history) {
			let bool = this.MEM.history.shift();
			input_g.checked = bool;
		}

		input_g.addEventListener('click', this.EVT.handleCheckChange);
		userData.checkbox = input_g;
		input_g.userData = userData;

		input_d.setAttribute('class', 'hover');
		input_d.addEventListener('click', this.EVT.handleCustomerClick);
		input_d.userData = userData;

		input_e.setAttribute('class', 'hover');
		input_e.addEventListener('click', this.EVT.handleRecipientClick);
		input_e.userData = userData;

		input_a.setAttribute("readonly", "readonly");
		input_b.setAttribute("readonly", "readonly");
		input_c.setAttribute("readonly", "readonly");
		input_d.setAttribute("readonly", "readonly");
		input_e.setAttribute("readonly", "readonly");
		input_f.setAttribute("readonly", "readonly");

		input_a.value = order.order_no;
		input_b.value = order.order_date;
		input_c.value = order.destination_division;
		input_d.value = order.customer.id;
		input_e.value = order.recipient.id;
		input_f.value = order.contact;

		value_a.appendChild(input_a);
		value_b.appendChild(input_b);
		value_c.appendChild(input_c);
		value_d.appendChild(input_d);
		value_e.appendChild(input_e);
		value_f.appendChild(input_f);
		checked.appendChild(input_g);

		div.appendChild(table);
		return div;

	}

	function api_createShipping(order, userData) {

		const div = document.createElement("div");
		div.setAttribute("class", "shipping");

		const table = document.createElement("table");
		userData.totals = {};

		for(let i = 0; i < 4; i++) {

			const row = table.insertRow();

			const label_a = row.insertCell();
			const value_a = row.insertCell();
			const label_b = row.insertCell();
			const value_b = row.insertCell();
			const label_c = row.insertCell();
			const value_c = row.insertCell();
			const label_d = row.insertCell();
			const value_d = row.insertCell();

			label_a.setAttribute("class", "label a");
			label_b.setAttribute("class", "label b");
			label_c.setAttribute("class", "label c");
			label_d.setAttribute("class", "label d");

			value_a.setAttribute("class", "value a");
			value_b.setAttribute("class", "value b");
			value_c.setAttribute("class", "value c");
			value_d.setAttribute("class", "value d");

			const input_a = document.createElement("input");
			const input_b = document.createElement("input");
			const input_c = document.createElement("input");
			const input_d = document.createElement("input");

			input_a.setAttribute("type", "text");
			input_b.setAttribute("type", "text");
			input_c.setAttribute("type", "text");
			input_d.setAttribute("type", "text");

			input_a.setAttribute("readonly", "readonly");
			input_b.setAttribute("readonly", "readonly");
			input_c.setAttribute("readonly", "readonly");
			input_d.setAttribute("readonly", "readonly");

			value_a.appendChild(input_a);
			value_b.appendChild(input_b);
			value_c.appendChild(input_c);
			value_d.appendChild(input_d);

			switch(i) {
			case 0:

				label_a.textContent = "依頼主名称";
				label_b.textContent = "お届け先名称";
				label_c.textContent = "代引金額";
				label_d.textContent = "代引区分";

				input_a.value = order.customer.name;
				input_b.value = order.recipient.name;
				input_c.value = order.cash_on_delivery_amount;
				input_d.value = order.cash_on_delivery_division;

				break;
			case 1:

				label_a.textContent = "依頼主郵便番号";
				label_b.textContent = "お届け先郵便番号";
				label_c.textContent = "発注金額";
				label_d.textContent = "発注金額(確定)";

				input_a.value = order.customer.post;
				input_b.value = order.recipient.post;
				input_c.value = order.order_amount;
				input_d.value = order.order_amount;
				userData.totals.subtotal = input_d;

				break;
			case 2:

				label_a.textContent = "依頼主住所";
				label_b.textContent = "お届け先住所";
				label_c.textContent = "消費税";
				label_d.textContent = "消費税(確定)";

				input_a.value = order.customer.addr;
				input_b.value = order.recipient.addr;
				input_c.value = order.consumption_tax;
				input_d.value = order.consumption_tax;
				userData.totals.sales_tax = input_d;

				break;
			case 3:

				label_a.textContent = "依頼主電話番号";
				label_b.textContent = "お届け先電話番号";
				label_c.textContent = "発注金額合計";
				label_d.textContent = "発注金額合計(確定)";

				input_a.value = order.customer.tel;
				input_b.value = order.recipient.tel;
				input_c.value = order.total_order_amount;
				input_d.value = order.total_order_amount;
				userData.totals.total = input_d;

				break;
			}

		}

		div.appendChild(table);
		return div;

	}

	function api_createProducts2(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "products");

		const table = document.createElement("table");

		// Thead

		const thead = document.createElement("thead");

		let row_1 = thead.insertRow();
		row_1.classList.add("dash");
		let row_2 = thead.insertRow();
		
		// Row 1

		const th_0 = document.createElement("th");
		const th_1 = document.createElement("th");
		const th_2 = document.createElement("th");
		const th_3 = document.createElement("th");
		const th_4 = document.createElement("th");
		const th_5 = document.createElement("th");
		const th_6 = document.createElement("th");
		const th_7 = document.createElement("th");
		const th_8 = document.createElement("th");
		const th_9 = document.createElement("th");

		// Row 2
	
		const th_a = document.createElement("th");
		const th_b = document.createElement("th");
		const th_c = document.createElement("th");
		const th_d = document.createElement("th");
		const th_e = document.createElement("th");
		const th_f = document.createElement("th");
		const th_g = document.createElement("th");
		const th_h = document.createElement("th");
		const th_i = document.createElement("th");
		const th_j = document.createElement("th");

		// Row 1 Labels

		th_0.textContent = "発注明細番号";
		th_1.textContent = "商品コード";
		th_2.textContent = "取引先商品番号";
		th_3.textContent = "品名(ジャンブレ)";
		th_4.textContent = "サイズ";
		th_5.textContent = "カラー";
		th_6.textContent = "コメント";
		th_7.textContent = "納期日付";
		th_8.textContent = "希望納期日付";
		th_9.textContent = "数量単位";

		// Row 2 Labels

		th_a.textContent = "受注明細番号";
		th_b.textContent = "受注番号";
		th_c.textContent = "加工有無区分";
		th_d.textContent = "品名(林製紙)";
		th_e.textContent = "発注単価";
		th_f.textContent = "発注数量";
		th_g.textContent = "入数";
		th_h.textContent = "受注数量";
		th_i.textContent = "受注単価";
		th_j.textContent = "発注金額";

		th_0.setAttribute("class", "a");
		th_1.setAttribute("class", "b");
		th_2.setAttribute("class", "c");
		th_3.setAttribute("class", "d");
		th_4.setAttribute("class", "e");
		th_5.setAttribute("class", "f");
		th_6.setAttribute("class", "g");
		th_7.setAttribute("class", "h");
		th_8.setAttribute("class", "i");
		th_9.setAttribute("class", "j");
		th_a.setAttribute("class", "k");
		th_b.setAttribute("class", "l");
		th_c.setAttribute("class", "m");
		th_d.setAttribute("class", "n");
		th_e.setAttribute("class", "o");
		th_f.setAttribute("class", "p");
		th_g.setAttribute("class", "q");
		th_h.setAttribute("class", "r");
		th_i.setAttribute("class", "s");
		th_j.setAttribute("class", "t");

		row_1.appendChild(th_0);
		row_1.appendChild(th_1);
		row_1.appendChild(th_2);
		row_1.appendChild(th_3);
		row_1.appendChild(th_4);
		row_1.appendChild(th_5);
		row_1.appendChild(th_6);
		row_1.appendChild(th_7);
		row_1.appendChild(th_8);
		row_1.appendChild(th_9);

		row_2.appendChild(th_a);
		row_2.appendChild(th_b);
		row_2.appendChild(th_c);
		row_2.appendChild(th_d);
		row_2.appendChild(th_e);
		row_2.appendChild(th_f);
		row_2.appendChild(th_g);
		row_2.appendChild(th_h);
		row_2.appendChild(th_i);
		row_2.appendChild(th_j);

		// Tbody

		const tbody = document.createElement("thead");
		for(let i = 0; i < order.details.length; i++) {

			row_1 = thead.insertRow();
			row_1.classList.add("dash");
			row_2 = thead.insertRow();

			if(i % 2 === 1) {
				row_1.classList.add("even");
				row_2.classList.add("even");
			}

			// Row 1

			let td_0 = row_1.insertCell();
			let td_1 = row_1.insertCell();
			let td_2 = row_1.insertCell();
			let td_3 = row_1.insertCell();
			let td_4 = row_1.insertCell();
			let td_5 = row_1.insertCell();
			let td_6 = row_1.insertCell();
			let td_7 = row_1.insertCell();
			let td_8 = row_1.insertCell();
			let td_9 = row_1.insertCell();

			// Row 2

			let td_a = row_2.insertCell();
			let td_b = row_2.insertCell();
			let td_c = row_2.insertCell();
			let td_d = row_2.insertCell();
			let td_e = row_2.insertCell();
			let td_f = row_2.insertCell();
			let td_g = row_2.insertCell();
			let td_h = row_2.insertCell();
			let td_i = row_2.insertCell();
			let td_j = row_2.insertCell();

			// Set Classes

			td_0.setAttribute('class', 'a');
			td_1.setAttribute('class', 'b');
			td_2.setAttribute('class', 'c');
			td_3.setAttribute('class', 'd');
			td_4.setAttribute('class', 'e');
			td_5.setAttribute('class', 'f');
			td_6.setAttribute('class', 'g');
			td_7.setAttribute('class', 'h');
			td_8.setAttribute('class', 'i');
			td_9.setAttribute('class', 'j');
			td_a.setAttribute('class', 'k');
			td_b.setAttribute('class', 'l');
			td_c.setAttribute('class', 'm');
			td_d.setAttribute('class', 'n');
			td_e.setAttribute('class', 'o');
			td_f.setAttribute('class', 'p');
			td_g.setAttribute('class', 'q');
			td_h.setAttribute('class', 'r');
			td_i.setAttribute('class', 's');
			td_j.setAttribute('class', 't');

			// Create Inputs

			let inputs = [];
			for(let k = 0; k < 20; k++) {
				inputs[k] = document.createElement('input');
				inputs[k].setAttribute('type', 'text');
				inputs[k].setAttribute('readonly', 'readonly');
			}

			// Append Inputs

			td_0.appendChild(inputs[0]);
			td_1.appendChild(inputs[1]);

			td_3.appendChild(inputs[3]);
			td_4.appendChild(inputs[4]);
			td_5.appendChild(inputs[5]);
			td_6.appendChild(inputs[6]);
			td_7.appendChild(inputs[7]);
			td_8.appendChild(inputs[8]);
			td_9.appendChild(inputs[9]);
			td_a.appendChild(inputs[10]);
			td_b.appendChild(inputs[11]);
			td_c.appendChild(inputs[12]);
			td_d.appendChild(inputs[13]);
			td_e.appendChild(inputs[14]);
			td_f.appendChild(inputs[15]);
			td_g.appendChild(inputs[16]);
			td_h.appendChild(inputs[17]);
			td_i.appendChild(inputs[18]);
			td_j.appendChild(inputs[19]);

			// Assign Values

			let details = order.details[i];
			let product = this.MEM.products[details.product_code];

			// Row 1 Values

			inputs[0].value = details.detail_no;
			inputs[1].value = details.product_code;

			if(product) {
				inputs[2].value = product.my_company_code;
				td_2.appendChild(inputs[2]);
			} else {
				inputs[2].value = details.supplier_item_number;
				inputs[2].classList.add('short');

				const button = document.createElement('button');
				button.textContent = 'マスター登録';
				td_2.appendChild(button);
				button.addEventListener('click', this.EVT.handleMasterClick);
				button.userData = details;
			}

			inputs[3].value = details.product_name;
			inputs[4].value = details.size;
			inputs[5].value = details.color;
			inputs[6].value = details.comment;
			inputs[7].value = details.delivery_date;
			inputs[8].value = details.desired_delivery_date;
			inputs[9].value = details.unit_of_measure;

			// Row 2 Values

			inputs[10].value = details.order_detail_number;
			inputs[11].value = details.order_number;
			inputs[12].value = details.processing_division;

			if(product) {
				inputs[13].value = product.my_company_name;
			} else {
				td_d.classList.add('error');
			}

			inputs[14].value = details.unit_price;
			inputs[15].value = details.order_quantity;

			if(product) {
				inputs[16].value = product.inner_count;
			} else {
				td_g.classList.add('error');
			}
			
			if(product) {
				let a = parseInt(details.order_quantity);
				let b = parseInt(product.inner_count);
				let c = a * b;
				inputs[17].value = c;
				let d = parseInt(details.order_amount);
				let e = (d / c).toFixed(2)
				inputs[18].value = e;
			} else {
				td_h.classList.add('error');
				td_i.classList.add('error');
			}

			inputs[19].value = details.order_amount;

		}

		table.appendChild(thead);
		table.appendChild(tbody);
		div.appendChild(table);

		return div;

	}

	function api_createProducts(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "products");

		const table = document.createElement("table");

		// Thead

		const thead = document.createElement("thead");

		let row_1 = thead.insertRow();
		row_1.classList.add("dash");
		let row_2 = thead.insertRow();
		
		// Row 1

		const th_0 = document.createElement("th");
		const th_1 = document.createElement("th");
		const th_2 = document.createElement("th");
		const th_3 = document.createElement("th");
		const th_4 = document.createElement("th");
		const th_5 = document.createElement("th");
		const th_6 = document.createElement("th");
		const th_7 = document.createElement("th");
		const th_8 = document.createElement("th");

		// Row 2
	
		const th_9 = document.createElement("th");
		const th_a = document.createElement("th");
		const th_b = document.createElement("th");
		const th_c = document.createElement("th");
		const th_d = document.createElement("th");
		const th_e = document.createElement("th");
		const th_f = document.createElement("th");
		const th_g = document.createElement("th");
		const th_h = document.createElement("th");

		// Row 1 Labels

		th_0.textContent = "発注明細番号";
		th_1.textContent = "商品コード";
		th_2.textContent = "取引先商品番号";
		th_3.textContent = "品名";
		th_4.textContent = "納期日付";
		th_5.textContent = "カラー";
		th_6.textContent = "コメント";
		th_7.textContent = "数量単位";
		th_8.textContent = "個口数";

		// Row 2 Labels

		th_9.textContent = "受注明細番号";
		th_a.textContent = "受注番号";
		th_b.textContent = "加工有無区分";
		th_c.textContent = "サイズ";
		th_d.textContent = "希望納期日付";
		th_e.textContent = "最新販売単価";
		th_f.textContent = "単価 EDI";
		th_g.textContent = "発注数量";
		th_h.textContent = "発注金額";

		th_0.setAttribute("class", "a");
		th_1.setAttribute("class", "b");
		th_2.setAttribute("class", "c");
		th_3.setAttribute("class", "d");
		th_4.setAttribute("class", "e");
		th_5.setAttribute("class", "f");
		th_6.setAttribute("class", "g");
		th_7.setAttribute("class", "h");
		th_8.setAttribute("class", "i");
		th_9.setAttribute("class", "j");
		th_a.setAttribute("class", "k");
		th_b.setAttribute("class", "l");
		th_c.setAttribute("class", "m");
		th_d.setAttribute("class", "n");
		th_e.setAttribute("class", "o");
		th_f.setAttribute("class", "p");
		th_g.setAttribute("class", "q");
		th_h.setAttribute("class", "r");

		row_1.appendChild(th_0);
		row_1.appendChild(th_1);
		row_1.appendChild(th_2);
		row_1.appendChild(th_3);
		row_1.appendChild(th_4);
		row_1.appendChild(th_5);
		row_1.appendChild(th_6);
		row_1.appendChild(th_7);
		row_1.appendChild(th_8);

		row_2.appendChild(th_9);
		row_2.appendChild(th_a);
		row_2.appendChild(th_b);
		row_2.appendChild(th_c);
		row_2.appendChild(th_d);
		row_2.appendChild(th_e);
		row_2.appendChild(th_f);
		row_2.appendChild(th_g);
		row_2.appendChild(th_h);

		// Tbody

		const tbody = document.createElement("thead");

		for(let i = 0; i < order.details.length; i++) {

			row_1 = thead.insertRow();
			row_1.classList.add("dash");
			row_2 = thead.insertRow();

			if(i % 2 === 1) {
				row_1.classList.add("even");
				row_2.classList.add("even");
			}

			// Row 1

			let td_0 = row_1.insertCell();
			let td_1 = row_1.insertCell();
			let td_2 = row_1.insertCell();
			let td_3 = row_1.insertCell();
			let td_4 = row_1.insertCell();
			let td_5 = row_1.insertCell();
			let td_6 = row_1.insertCell();
			let td_7 = row_1.insertCell();
			let td_8 = row_1.insertCell();

			// Row 2

			let td_9 = row_2.insertCell();
			let td_a = row_2.insertCell();
			let td_b = row_2.insertCell();
			let td_c = row_2.insertCell();
			let td_d = row_2.insertCell();
			let td_e = row_2.insertCell();
			let td_f = row_2.insertCell();
			let td_g = row_2.insertCell();
			let td_h = row_2.insertCell();

			td_0.setAttribute('class', 'a');
			td_1.setAttribute('class', 'b');
			td_2.setAttribute('class', 'c');
			td_3.setAttribute('class', 'd');
			td_4.setAttribute('class', 'e');
			td_5.setAttribute('class', 'f');
			td_6.setAttribute('class', 'g');
			td_7.setAttribute('class', 'h');
			td_8.setAttribute('class', 'i');
			td_9.setAttribute('class', 'j');
			td_a.setAttribute('class', 'k');
			td_b.setAttribute('class', 'l');
			td_c.setAttribute('class', 'm');
			td_d.setAttribute('class', 'n');
			td_e.setAttribute('class', 'o');
			td_f.setAttribute('class', 'p');
			td_g.setAttribute('class', 'q');
			td_h.setAttribute('class', 'r');

			// Row 1

			let input_0 = document.createElement("input");
			let input_1 = document.createElement("input");
			let input_2 = document.createElement("input");
			let input_3 = document.createElement("input");
			let input_4 = document.createElement("input");
			let input_5 = document.createElement("input");
			let input_6 = document.createElement("input");
			let input_7 = document.createElement("input");
			let input_8 = document.createElement("input");

			// Row 2

			let input_9 = document.createElement("input");
			let input_a = document.createElement("input");
			let input_b = document.createElement("input");
			let input_c = document.createElement("input");
			let input_d = document.createElement("input");
			let input_e = document.createElement("input");
			let input_f = document.createElement("input");
			let input_g = document.createElement("input");
			let input_h = document.createElement("input");


			input_0.setAttribute('type', 'text');
			input_1.setAttribute('type', 'text');
			input_2.setAttribute('type', 'text');
			input_3.setAttribute('type', 'text');
			input_4.setAttribute('type', 'text');
			input_5.setAttribute('type', 'text');
			input_6.setAttribute('type', 'text');
			input_7.setAttribute('type', 'text');
			input_9.setAttribute('type', 'text');
			input_a.setAttribute('type', 'text');
			input_b.setAttribute('type', 'text');
			input_c.setAttribute('type', 'text');
			input_d.setAttribute('type', 'text');
			input_e.setAttribute('type', 'text');
			input_f.setAttribute('type', 'text');
			input_g.setAttribute('type', 'text');
			input_h.setAttribute('type', 'text');

			input_0.setAttribute('readonly', 'readonly');
			input_1.setAttribute('readonly', 'readonly');
			input_2.setAttribute('readonly', 'readonly');
			input_3.setAttribute('readonly', 'readonly');
			input_4.setAttribute('readonly', 'readonly');
			input_5.setAttribute('readonly', 'readonly');
			input_6.setAttribute('readonly', 'readonly');
			input_7.setAttribute('readonly', 'readonly');
			input_8.setAttribute('placeholder', '個口数');

			input_9.setAttribute('readonly', 'readonly');
			input_a.setAttribute('readonly', 'readonly');
			input_b.setAttribute('readonly', 'readonly');
			input_c.setAttribute('readonly', 'readonly');
			input_d.setAttribute('readonly', 'readonly');
			input_e.setAttribute('readonly', 'readonly');
			input_f.setAttribute('readonly', 'readonly');
			input_g.setAttribute('readonly', 'readonly');
			input_h.setAttribute('readonly', 'readonly');
			
			td_0.appendChild(input_0);
			td_1.appendChild(input_1);
			td_2.appendChild(input_2);
			td_3.appendChild(input_3);
			td_4.appendChild(input_4);
			td_5.appendChild(input_5);
			td_6.appendChild(input_6);
			td_7.appendChild(input_7);
			td_8.appendChild(input_8);
			td_9.appendChild(input_9);
			td_a.appendChild(input_a);
			td_b.appendChild(input_b);
			td_c.appendChild(input_c);
			td_d.appendChild(input_d);


			td_g.appendChild(input_g);
			td_h.appendChild(input_h);

			// Row 1

			input_0.value = order.details[i].detail_no;
			input_1.value = order.details[i].product_code;
			input_2.value = order.details[i].supplier_item_number;
			input_3.value = order.details[i].product_name;
			input_4.value = order.details[i].delivery_date;
			input_5.value = order.details[i].color;
			input_6.value = order.details[i].comment;
			input_7.value = order.details[i].unit_of_measure;
			input_8.value = order.details[i].order_quantity;
			order.details[i].case_quantity = order.details[i].quantity;

			input_8.addEventListener('input', this.EVT.handleQuantityChange);
			input_8.localData = order.details[i];

			// Row 2

			input_9.value = order.details[i].order_detail_number;
			input_a.value = order.details[i].order_number;
			input_b.value = order.details[i].processing_division;
			input_c.value = order.details[i].size;
			input_d.value = order.details[i].desired_delivery_date;
			input_e.value = "Master";
			input_f.value = order.details[i].unit_price;
			input_g.value = order.details[i].order_quantity;
			input_h.value = order.details[i].order_amount;
			order.details[i].my_company_code = "";

			// Add select options
			
			const userData = {
				data : order.details[i],
				input : input_h
			}

			input_e.addEventListener('click', this.EVT.handlePriceInputClick);
			input_f.addEventListener('click', this.EVT.handlePriceInputClick);
			
			let half_code = order.details[i].supplier_item_number;

			let codeFound = null;
			for(let k = 0; k < this.MEM.products.length; k++) {
				let my_company = parseInt(this.MEM.products[k].my_company_code);
				if(my_company !== parseInt(half_code)) {
					continue;
				}

				codeFound = this.MEM.products[k];
				order.details[i].my_company_code = codeFound.my_company_code;
				break;
			}
			
			if(!codeFound) {
				input_e.value = 'None';
				continue;
			}

			userData.price = [
				codeFound.jyanpure_price,
				order.details[i].unit_price
			];

			input_e.value = codeFound.jyanpure_price;
			let a = parseFloat(codeFound.jyanpure_price);
			let b = parseFloat(order.details[i].unit_price);

			if(a !== b ) {
				td_e.setAttribute('class', 'warn');
				td_f.setAttribute('class', 'warn');
				continue;
			}

			radio1.setAttribute("disabled", "disabled");
			radio2.setAttribute("disabled", "disabled");
			radio2.checked = true;

		}

		table.appendChild(thead);
		table.appendChild(tbody);
		div.appendChild(table);

		return div;

	}

	function api_createWarehouse(order) {

		const div = document.createElement("div");
		div.setAttribute("class", "products");

		const table = document.createElement("table");

		// Thead

		const thead = document.createElement("thead");
		let row = thead.insertRow();
		
		// Row 1

		const th_0 = document.createElement("th");
		const th_1 = document.createElement("th");
		const th_2 = document.createElement("th");
		const th_3 = document.createElement("th");
		const th_4 = document.createElement("th");
		const th_5 = document.createElement("th");

		th_0.textContent = "受注番号";
		th_1.textContent = "倉庫：加工業者名称";
		th_2.textContent = "倉庫：加工業者郵便番号";
		th_3.textContent = "倉庫：加工業者住所";
		th_4.textContent = "倉庫：加工業者電話番号";
		th_5.textContent = "倉庫：加工業者FAX番号";

		th_0.setAttribute("class", "e01");
		th_1.setAttribute("class", "e02");
		th_2.setAttribute("class", "e03");
		th_3.setAttribute("class", "e04");
		th_4.setAttribute("class", "e05");
		th_5.setAttribute("class", "e06");

		row.appendChild(th_0);
		row.appendChild(th_1);
		row.appendChild(th_2);
		row.appendChild(th_3);
		row.appendChild(th_4);
		row.appendChild(th_5);

		// Tbody

		const tbody = document.createElement("tbody");
		row = tbody.insertRow();

		let td_0 = row.insertCell();
		let td_1 = row.insertCell();
		let td_2 = row.insertCell();
		let td_3 = row.insertCell();
		let td_4 = row.insertCell();
		let td_5 = row.insertCell();

		td_0.setAttribute('class', 'e01');
		td_1.setAttribute('class', 'e02');
		td_2.setAttribute('class', 'e03');
		td_3.setAttribute('class', 'e04');
		td_4.setAttribute('class', 'e05');
		td_4.setAttribute('class', 'e06');

		let input_0 = document.createElement("input");
		let input_1 = document.createElement("input");
		let input_2 = document.createElement("input");
		let input_3 = document.createElement("input");
		let input_4 = document.createElement("input");
		let input_5 = document.createElement("input");

		input_0.setAttribute('type', 'text');
		input_1.setAttribute('type', 'text');
		input_2.setAttribute('type', 'text');
		input_3.setAttribute('type', 'text');
		input_4.setAttribute('type', 'text');
		input_5.setAttribute('type', 'text');

		input_0.setAttribute('readonly', 'readonly');
		input_1.setAttribute('readonly', 'readonly');
		input_2.setAttribute('readonly', 'readonly');
		input_3.setAttribute('readonly', 'readonly');
		input_4.setAttribute('readonly', 'readonly');
		input_5.setAttribute('readonly', 'readonly');

		td_0.appendChild(input_0);
		td_1.appendChild(input_1);
		td_2.appendChild(input_2);
		td_3.appendChild(input_3);
		td_4.appendChild(input_4);
		td_5.appendChild(input_4);

		input_0.value = order.order_number;
		input_1.value = order.warehouse.processor_name;
		input_2.value = order.warehouse.processor_postcode;
		input_3.value = order.warehouse.processor_address
		input_4.value = order.warehouse.processor_tel;
		input_5.value = order.warehouse.processor_fax;

		table.appendChild(thead);
		table.appendChild(tbody);
		div.appendChild(table);

		return div;

	}

	function api_readFileBinary(file) {

		return new Promise( (resolve, reject) => {

			const reader = new FileReader();

			reader.onload = (evt) => {
				resolve(evt.target.result);
			}

			reader.onerror = (evt) => {
				reader.abort();
				reject();
			}

			reader.readAsArrayBuffer(file);

		});

	}

	function api_processCsv(headers, content) {

		const processed = {};

		let moto_barai = 0;
		let dai_biki = 0;

		for(let i = 0; i < headers.length; i++) {

			const item = {};
			const lines = headers[i].split(",");
			
			// 0 発注番号
			item.order_no = lines.shift();
			// 1 発注伝票日付
			let order_date = lines.shift();

			let parts = [
				order_date.substr(0, 4),
				order_date.substr(4, 2),
				order_date.substr(6, 2)
			];

			item.order_date = parts.join("-");
			
			item.supply = {
				// 2 仕入先コード
				id : lines.shift().trim(),
				// 3 仕入先名称
				name : lines.shift().trim()
			}

			item.customer = {
				// 4 依頼主顧客コード
				id : lines.shift().trim(),
				// 5 依頼主名称
				name : lines.shift().trim(),
				// 6 依頼主郵便番号
				post : lines.shift().trim(),
				// 7 依頼主住所
				addr : lines.shift().trim(),
				// 8 依頼主電話番号
				tel : lines.shift().trim()
			}

			item.recipient = {
				// 9 お届け先コード
				id : lines.shift().trim(),
				// 10 お届け先名称
				name : lines.shift().trim(),
				// 11 お届け先郵便番号
				post : lines.shift().trim(),
				// 12 お届け先住所
				addr : lines.shift().trim(),
				// 13 お届け先電話番号
				tel : lines.shift().trim()
			}

			item.details = [];
			processed[item.order_no] = item;
			
			// 14 送り先区分
			item.destination_division = lines.shift().trim();

			item.warehouse = {
				// 15 倉庫：加工業者名称
				processor_name : lines.shift().trim(),
				// 16 倉庫：加工業者郵便番号
				processor_postcode : lines.shift().trim(),
				// 17 倉庫：加工業者住所
				processor_address : lines.shift().trim(),
				// 18 倉庫：加工業者電話番号
				processor_tel : lines.shift().trim(),
				// 19 倉庫：加工業者FAX番号
				processor_fax : lines.shift().trim()
			}

			// 20 受注番号
			item.order_number = lines.shift().trim();
			// 21 代引金額
			item.cash_on_delivery_amount = parseInt(lines.shift().trim());
			// 22 発注金額
			item.order_amount = parseInt(lines.shift().trim());
			// 23 消費税
			item.consumption_tax = parseInt(lines.shift().trim());
			// 24 発注金額合計
			item.total_order_amount = parseInt(lines.shift().trim());
			// 25 代引区分
			item.cash_on_delivery_division = lines.shift().trim();
			// 26 お届け先所属・担当者名
			item.contact = lines.shift().trim();

			let type = parseInt(item.cash_on_delivery_division);
			item.prefix = (type === 0) ? '1' : '2';

			// -- No Data for the Following --
			// 27 (依頼主)メールアドレス
			// 28 (依頼主)FAX番号
			// 29 仕入先メールアドレス1
			// 30 仕入先メールアドレス2
			// 31 仕入先メールアドレス3
			// 32 仕入先FAX番号
			// 33 メモ欄

		}

		for(let i = 0; i < content.length; i++) {

			const lines = content[i].split(",");

			const item = {};
			const order_no = lines.shift();
			const order = processed[order_no];

			if(!order) {
				continue;
			}

			// 0 発注明細番号
			item.detail_no = lines.shift().trim();
			// 1 商品コード
			item.product_code = lines.shift().trim();

			// 2 取引先商品番号
			let number = lines.shift().trim();
			number = this.API.numHalfToFullB(number);
			item.supplier_item_number = number;

			// 3 品名
			item.product_name = lines.shift().trim();
			// 4 加工有無区分
			item.processing_division = lines.shift().trim();
			// 5 カラー
			item.color = lines.shift().trim();
			// 6 サイズ
			item.size = lines.shift().trim();
			// 7 数量単位
			item.unit_of_measure = lines.shift().trim();
			// 8 発注単価
			item.unit_price = parseInt(lines.shift().trim());
			// 9 発注数量
			item.order_quantity = parseInt(lines.shift().trim());
			// 10 発注金額
			item.order_amount = parseInt(lines.shift().trim());
			// 11 納期日付（旭産業納入納期）
			item.delivery_date = lines.shift().trim();
			// 12 希望納期日付（顧客業希望納期）
			item.desired_delivery_date = lines.shift().trim();
			// 13 コメント
			item.comment = lines.shift().trim();
			// 14 受注番号
			item.order_number = lines.shift().trim();
			// 15 受注明細番号
			item.order_detail_number = lines.shift().trim();

			if(order.prefix === '1') {
				moto_barai++;
				let str = moto_barai.toString();
				while(str.length < 3) {
					str = '0' + str;
				}
				item.destination_slip = '1' + str;
			} else {
				dai_biki++;
				let str = dai_biki.toString();
				while(str.length < 3) {
					str = '0' + str;
				}
				item.destination_slip = '2' + str;
			}

			order.details.push(item);

		}

		const array = [];

		for(let key in processed) {
			array.push(processed[key]);
		}

		return array;

	}

	function api_numFullToHalf(source) {

		let latin = "";
		let date = false;

		for(let i = 0; i < source.length; i++) {

			switch(source.charAt(i)) {
			case "．":
			case ".":
				date = true;
				latin += "-";
				break;
			case "０":
			case "0":
				latin += "0";
				break;
			case "１":
			case "1":
				latin += "1";
				break;
			case "２":
			case "2":
				latin += "2";
				break;
			case "３":
			case "3":
				latin += "3";
				break;
			case "４":
			case "4":
				latin += "4";
				break;
			case "５":
			case "5":
				latin += "5";
				break;
			case "６":
			case "6":
				latin += "6";
				break;
			case "７":
			case "7":
				latin += "7";
				break;
			case "８":
			case "8":
				latin += "8";
				break;
			case "９":
			case "9":
				latin += "9";
				break;
			}

		}

		if(date) {
			let year = (new Date()).getFullYear();
			let prefix = year.toString().substr(0, 2);
			latin = prefix + latin;
			latin = latin.substr(0, 10);
		} else {
			latin = parseInt(latin);
		}

		return latin;

	}


	function api_numHalfToFullB(source) {

		let latin = "";

		const wide = [
			'０', '１', '２', '３',
			'４', '５', '６', '７',
			'８', '９', 'Ａ', 'Ｂ',
			'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ',
			'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ',
			'Ｋ', 'Ｌ', 'Ｍ', 'Ｎ',
			'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ',
			'Ｓ', 'Ｔ', 'Ｕ', 'Ｖ',
			'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
		];

		const half = [
			'0', '1', '2', '3',
			'4', '5', '6', '7',
			'8', '9', 'A', 'B',
			'C', 'D', 'E', 'F',
			'G', 'H', 'I', 'J',
			'K', 'L', 'M', 'N',
			'O', 'P', 'Q', 'R',
			'S', 'T', 'U', 'V',
			'W', 'X', 'Y', 'Z'
		];

		for(let i = 0; i < source.length; i++) {

			let ch = source.charAt(i);
			let index = wide.indexOf(ch);
			if(index === -1) {
				continue;
			}
			latin += half[index];

		}

		return latin;

	}



}).apply({});

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

const C600 = (function() {

	this.MEM = {}

	this.DOM = {
		csv : {
			area : document.getElementById('C600.csv.area'),
			preview : document.getElementById('C600.csv.preview')
		},
		output : {
			textarea : document.getElementById('C600.output.textarea'),
			fmt_send : document.getElementById('C600.output.fmt_send'),
			fmt_wsd : document.getElementById('C600.output.fmt_wsd'),
			sjis : document.getElementById('C600.output.sjis'),
			utf8 : document.getElementById('C600.output.utf8'),
			yes_comments : document.getElementById('C600.output.yes_comments'),
			no_comments : document.getElementById('C600.output.no_comments'),
			filename : document.getElementById('C600.output.filename'),
			submit : document.getElementById('C600.output.submit'),
			clear : document.getElementById('C600.output.clear')
		},
		history : {
			select : document.getElementById('C600.history.select'),
			input : document.getElementById('C600.history.input'),
			search : document.getElementById('C600.history.search'),
			reset : document.getElementById('C600.history.reset'),
			back : document.getElementById('C600.history.back'),
			list : document.getElementById('C600.history.list')
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
		handleInputKeyDown : evt_handleInputKeyDown.bind(this),
		handleInputClick : evt_handleInputClick.bind(this),
		handleQuantityChange : evt_handleQuantityChange.bind(this)
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
		matchProductCode : api_matchProductCode.bind(this),
		updateAllTotalValues : api_updateAllTotalValues.bind(this)
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

		this.DOM.output.fmt_send.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.fmt_wsd.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.sjis.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.utf8.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.yes_comments.addEventListener('change', this.EVT.handleRadioChange);
		this.DOM.output.no_comments.addEventListener('change', this.EVT.handleRadioChange);
	
		this.DOM.output.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.output.clear.addEventListener('click', this.EVT.handleClearClick);

	}

	function evt_handleQuantityChange(evt) {

		let elem = evt.target;
		let localData = elem.localData;
		localData.case_quantity = elem.value;
		this.API.renderOutput();

	}

	function api_updateAllTotalValues() {

		console.log("updating all values!!!");

		console.log(this.MEM.userData[0]);

		this.MEM.userData.forEach( userData => {
			
			let sum = 0;

			let order = userData.data;
			let details = order.details;

			details.forEach( detail => {
				sum += parseFloat(detail.total);
			});

			order.total_order_amount = sum.toString();
			userData.totals.subtotal.value = sum;


		});

	}

	function evt_handleInputClick(evt) {

		let elem = evt.target;
		let radio = elem.previousSibling;

		if(radio.getAttribute("disabled")) {
			return;
		}

		radio.click();

	}

	function evt_handleInputKeyDown(evt) {

		console.log("input keydown!!!!");
		
		const ENTER_KEY = 13;
		if(evt.keyCode !== 13) {
			return;
		}

		let elem = evt.target;
		let localData = elem.localData;
		if(!localData) {
			return;
		}

		this.API.matchProductCode(localData);

	}

	function api_matchProductCode(localData) {

		console.log("search for product code!!!");
		console.log(localData);

		let elem = localData.code;
		let code = elem.value;
		let detail = localData.data;

		let codeFound = null;
		for(let k = 0; k < this.MEM.products.length; k++) {
			let p = this.MEM.products[k];
			if(p.my_company_code !== code) {
				continue;
			}

			codeFound = this.MEM.products[k];
			break;
		}
		
		if(!codeFound) {

			localData.price_display.value = "";
			detail.my_company_code = "";

			localData.radio[0].checked = false;
			localData.radio[1].checked = false;
			localData.radio[0].parentNode.parentNode.setAttribute("class", "j error");
			localData.radio[1].parentNode.parentNode.setAttribute("class", "j error");

			localData.radio[0].setAttribute("disabled", "disabled");
			localData.radio[1].setAttribute("disabled", "disabled");

		} else {

			//localData.name_display.value = codeFound.product_name;
			localData.price_display.value = codeFound.forest_price;
			detail.my_company_code = codeFound.my_company_code;

			if(codeFound.forest_price === localData.data.price) {

				localData.radio[0].parentNode.parentNode.setAttribute("class", "j");
				localData.radio[1].parentNode.parentNode.setAttribute("class", "j");

				localData.radio[0].checked = true;
				localData.radio[1].checked = false;

				localData.radio[0].setAttribute("disabled", "disabled");
				localData.radio[1].setAttribute("disabled", "disabled");

			} else if(localData.radio[0].checked || localData.radio[1].checked) {

				localData.radio[0].parentNode.parentNode.setAttribute("class", "j edit");
				localData.radio[1].parentNode.parentNode.setAttribute("class", "j edit");

				localData.radio[0].removeAttribute("disabled");
				localData.radio[1].removeAttribute("disabled");

			} else {

				localData.radio[0].parentNode.parentNode.setAttribute("class", "j warn");
				localData.radio[1].parentNode.parentNode.setAttribute("class", "j warn");

				localData.radio[0].removeAttribute("disabled");
				localData.radio[1].removeAttribute("disabled");

			}

			localData.price = [
				codeFound.forest_price,
				localData.data.price
			];

		}

	}

	function evt_handlePriceInputClick(evt) {

		console.log("price input!!");

		const elem = evt.target;
		const radio = elem.previousSibling;
		radio.click();

	}

	function evt_handlePriceRadioChange(evt) {

		let elem = evt.target;
		let userData = elem.localData;

		console.log(userData);

		if(!userData) {
			return;
		}

		let index = userData.radio.indexOf(elem);
		let price = parseFloat(userData.price[index]);

		userData.radio[0].parentNode.parentNode.classList.remove("warn");
		userData.radio[1].parentNode.parentNode.classList.remove("warn");

		userData.radio[0].parentNode.parentNode.classList.add("edit");
		userData.radio[1].parentNode.parentNode.classList.add("edit");

		console.log(userData.data);

		let count = userData.data.quantity;
		let subtotal = (price * count).toFixed(3);

		let parts = subtotal.split(".");
		while(parts[1][parts[1].length - 1] === "0") {
			parts[1] = parts[1].substr(0, parts[1].length - 1);
		}
		
		if(parts[1].length) {
			subtotal = parts.join(".");
		} else {
			subtotal = parts[0];
		}

		console.log(price);
		console.log(count);

		userData.input.value = subtotal;
		userData.data.unit_price = price;
		userData.data.total = subtotal;
		this.API.updateAllTotalValues();
		this.API.renderOutput();

	}

	function evt_handleClearClick() {

		this.DOM.history.list.innerHTML = "";
		this.DOM.output.textarea.value = "";
		this.DOM.output.filename.value = "";
		this.DOM.csv.preview.innerHTML = "";
		delete this.MEM.userData;

	}

	async function evt_handleSubmitClick() {
	
		if(this.DOM.output.textarea.value.length === 0) {
			return;
		}

		const keyword = this.DOM.output.textarea.value;

		const orders = [];
		this.MEM.userData.forEach( userData => {

			const order = userData.data;
			order.checked = userData.checkbox.checked ? 1 : 0;
			let str = JSON.stringify(order);
			let o = JSON.parse(str);
			orders.push(order);

		});

		try {
			await Jaxer.API.logOutput(orders);
		} catch(err) {
			throw err;
		}

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

		this.API.renderOutput();

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

		cell_0.textContent = "特記欄";
		cell_2.textContent = "予備項目１";
		cell_4.textContent = "予備項目２";
		cell_6.textContent = "予備項目３";
		cell_8.textContent = "予備項目４";
		cell_a.textContent = "予備項目５";

		cell_1.setAttribute("class", "value");
		cell_3.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");
		cell_7.setAttribute("class", "value");
		cell_9.setAttribute("class", "value");
		cell_b.setAttribute("class", "value");

		cell_1.textContent = order.special_column;
		cell_3.textContent = order.reserved.note1;
		cell_5.textContent = order.reserved.note2;
		cell_7.textContent = order.reserved.note3;
		cell_9.textContent = order.reserved.note4;
		cell_b.textContent = order.reserved.note5;

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

		th_a.textContent = "商品コード";
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
			cell_3.textContent = detail.price;
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

		// Labels

		const cell_0 = row_a.insertCell();

		cell_0.setAttribute("class", "label");
		cell_0.textContent = "	発注合計金額（税抜）";

		// Values

		const cell_1 = row_a.insertCell();
		cell_1.setAttribute("class", "value");
		cell_1.textContent = order.total_order_amount

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

		// Labels

		const cell_0 = row_a.insertCell();
		const cell_1 = row_b.insertCell();
		const cell_2 = row_c.insertCell();

		cell_0.setAttribute("class", "label");
		cell_1.setAttribute("class", "label");
		cell_2.setAttribute("class", "label");

		cell_0.textContent = "納品先名";
		cell_1.textContent = "納品先住所";
		cell_2.textContent = "納品先電話番号";

		// Values

		const cell_3 = row_a.insertCell();
		const cell_4 = row_b.insertCell();
		const cell_5 = row_c.insertCell();

		cell_3.setAttribute("class", "value");
		cell_4.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");

		cell_3.textContent = order.delivery.name;
		cell_4.textContent = order.delivery.address;
		cell_5.textContent = order.delivery.tel;

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

		const cell_0 = row_a.insertCell();
		const cell_1 = row_b.insertCell();
		const cell_2 = row_c.insertCell();

		cell_0.setAttribute("class", "label");
		cell_1.setAttribute("class", "label");
		cell_2.setAttribute("class", "label");

		cell_0.textContent = "取引先当社ID";
		cell_1.textContent = "仕入先コード";
		cell_2.textContent = "仕入先名";

		// Values

		const cell_3 = row_a.insertCell();
		const cell_4 = row_b.insertCell();
		const cell_5 = row_c.insertCell();

		cell_3.setAttribute("class", "value");
		cell_4.setAttribute("class", "value");
		cell_5.setAttribute("class", "value");

		cell_3.textContent = order.supplier.company_id;
		cell_4.textContent = order.supplier.code;
		cell_5.textContent = order.supplier.name;

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
		const row1 = tbl1.insertRow();

		const cell_0 = row1.insertCell();
		const cell_1 = row1.insertCell();
		const cell_2 = row1.insertCell();
		const cell_3 = row1.insertCell();
		const cell_4 = row1.insertCell();
		const cell_5 = row1.insertCell();
		
		cell_0.setAttribute('class', 'label a');
		cell_1.setAttribute('class', 'value a');
		cell_2.setAttribute('class', 'label b');
		cell_3.setAttribute('class', 'value b');
		cell_4.setAttribute('class', 'label c');
		cell_5.setAttribute('class', 'value c');

		let d = order.order_date;
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
		cell_4.textContent = "発注区分:";
		cell_5.textContent = order.order_classification;

		div1.appendChild(tbl1);
		meta.appendChild(div1);
		
		// Second Row

		const div2 = document.createElement('div');
		div2.setAttribute("class", "row pad");

		const tbl2 = document.createElement("table");
		const row2 = tbl2.insertRow();

		const cell_6 = row2.insertCell();
		const cell_7 = row2.insertCell();
		const cell_8 = row2.insertCell();
		const cell_9 = row2.insertCell();
		
		cell_6.setAttribute('class', 'label e');
		cell_7.setAttribute('class', 'value e');
		cell_8.setAttribute('class', 'label f');
		cell_9.setAttribute('class', 'value f');

		d = order.designated_delivery_date;
		y = d.getFullYear();

		m = d.getMonth().toString();
		if(m.length < 2) {
			m = "0" + m;
		}

		h = d.getDate().toString();
		if(h.length < 2) {
			h = "0" + h;
		}

		cell_6.textContent = "指定納期:";
		cell_7.textContent = [y, m, h].join("-");
		cell_8.textContent = "納期回答:";
		cell_9.textContent = order.delivery_response;

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

		cell_a.textContent = "納品先倉庫コード:";
		cell_b.textContent = order.delivery.warehouse_code;

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

		console.log("implement search!!!");

		// Reset all of the checkbox elements

		this.API.resetCheckList();

		// Step 1 : Exclude

		const exclude = [];
		const array = this.MEM.userData || [];
		array.forEach( userData => {
			console.log(userData);
			exclude.push(userData.data.order_uuid);
		});

		let search_term = this.DOM.history.select.value;
		let search_key = this.DOM.history.input.value;

		console.log(search_term);
		console.log(search_key);

		// Step 2 : Show in-browser results

		array.forEach( userData => {

			let src;

			switch(search_term) {
			case "order_no":
				src = userData.data.order_no;
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

		let data;

		try {
			data = await Jaxer.API.searchOrders(search_term, search_key, exclude);
		} catch(err) {
			throw err;
		}

		console.log(data);

		if(!data) {
			return;
		}

		data.forEach( order => {
			let li = this.API.renderHistoryItem(order);
			this.DOM.history.list.appendChild(li);
		});
	}

	function evt_handleCustomerClick(evt) {

		console.log("Customer click!!!");

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

		console.log("RecipientClick !!");

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

	function api_renderOutput() {
		
		if(!this.MEM.userData) {
			return;
		}
		
		if(this.DOM.output.fmt_send.checked) {
			this.API.createSendFormat();
		} else if(this.DOM.output.fmt_wsd.checked) {
			this.API.createWsdFormat();
		}

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

			const order = userData.data;

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

			row.push("");

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

			row.push(order.delivery.tel);

			// Position 23 Unknown

			row.push("");

			// Position 24 << 届け先TEL (formated) >>

			row.push(getFormatPhone(order.delivery.tel) || "");

			// Position 25 << 届け先名 (30文字) >>

			let recipient_name = order.delivery.name;
			while(recipient_name.length < 30) {
				recipient_name += " ";
			}

			row.push(recipient_name);

			// Position 26 << 届け先住所 (51文字) >>

			let recipient_addr = order.delivery.address;
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

			// row.push(getFormatPhone(order.customer.tel));
			row.push("");

			// Position 31

			row.push(" ");

			// Position 32  << 出荷名 >>

			let shipper_name = order.delivery.name;
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
				"# 発注No.",
				"発注日",
				"発注区分",
				"指定納期",
				"納期回答"
			].join(","));
			
			records.push([
				"# 取引先当社ID",
				"仕入先コード",
				"仕入先名"
			].join(","));

			records.push([
				"# 納品先名",
				"納品先住所",
				"納品先電話番号",
				"納品先倉庫コード"
			].join(","));

			records.push([
				"# 特記欄",
				"予備項目１",
				"予備項目２",
				"予備項目３",
				"予備項目４",
				"予備項目５",
			].join(","));

			records.push([
				"# 発注明細番号",
				"商品番号",
				"商品名",
				"JANコード1",
				"JANコード2",
				"メーカー型番",
				"取引先品番",
				"数量",
				"単位",
				"単価",
				"合計",
				"個口数"
			].join(","));

			records.push([
				"# 発注合計金額（税抜）"
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
			
			if(!userData.selected.checked) {
				return;
			}

			const order = userData.data;

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
				order.order_date,
				order.order_classification,
				order.designated_delivery_date,
				order.delivery_response
			].join(","));

			// Third Line
			
			records.push([
				order.supplier.company_id,
				order.supplier.code,
				order.supplier.name
			].join(","));

			// Fourth Line

			records.push([
				order.delivery.name,
				order.delivery.address,
				order.delivery.tel,
				order.delivery.warehouse_code
			].join(","));

			// Fifth Line
			
			records.push([
				order.special_column,
				order.reserved.note1,
				order.reserved.note2,
				order.reserved.note3,
				order.reserved.note4,
				order.reserved.note5
			].join(","));

			// Sixth Line
			
			for(let i = 0; i < order.details.length; i++) {
				
				records.push([
					order.details[i].detail_line_number,
					order.details[i].product_code,
					order.details[i].product_name,
					order.details[i].jan_code1,
					order.details[i].jan_code2,
					order.details[i].manufacturer_model_number,
					order.details[i].supplier_part_number,
					order.details[i].case_quantity,
					order.details[i].unit,
					order.details[i].price,
					order.details[i].total
				].join(","));

			}

			// Seventh Line

			records.push([
				order.total_order_amount
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

		const content = [];

		for(let i = 0; i < files.length; i++) {

			let file = files[i];
			let name = file.name;
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
			let firstLine = lines.shift();

			if(lines[lines.length - 1].length === 0) {
				lines.pop();
			}

			if(firstLine.indexOf("連番,取引先当社ID,仕入先コード,") !== 0) {
				continue;
			}
			
			lines.forEach( line => {
				content.push(line);
			});

		}

		// Start Process Here

		let processed = this.API.processCsv(content);
		try {
			this.MEM.products = await Jaxer.API.selectProducts();
		} catch(err) {
			throw err;
		}
		
		let data;
		try {
			data = await Jaxer.API.insertOrders(processed);
		} catch(err) {
			throw err;
		}
		
		for(let i = 0; i < data.length; i++) {
			processed[i].order_uuid = data[i];
		}

		this.API.renderOrders(processed);
		this.API.renderOutput();

	}

	function api_renderOrders(processed) {

		this.MEM.userData = [];
		this.DOM.csv.preview.innerHTML = "";

		this.MEM.userData = [];

		processed.forEach( order => {

			const li = document.createElement("li");

			const userData = {
				li : li,
				data : order
			};
			this.MEM.userData.push(userData);

			let a = this.API.createTopRow(order, userData);
			let b = this.API.createShipping(order, userData);
			let c = this.API.createProducts(order, userData);
			let d = this.API.createWarehouse(order, userData);

			li.appendChild(a);
			li.appendChild(b);
			li.appendChild(c);
			li.appendChild(d);

			this.DOM.csv.preview.appendChild(li);

		});

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

		label_a.textContent = "発注No.:";
		label_b.textContent = "発注日:";
		label_c.textContent = "発注区分:";
		label_d.textContent = "指定納期:";
		label_e.textContent = "納期回答:";
		label_f.textContent = "納品先倉庫コード:";

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
		userData.selected = input_g;

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
		input_c.value = order.order_classification;
		input_d.value = order.designated_delivery_date;
		input_e.value = order.delivery_response;
		input_f.value = order.delivery.warehouse_code;

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


		for(let i = 0; i < 3; i++) {

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

				label_a.textContent = "取引先当社ID";
				label_b.textContent = "納品先名";
				label_c.textContent = "発注合計金額（税抜）";
				label_d.textContent = "発注合計金額（確定）";

				input_a.value = order.supplier.company_id;
				input_b.value = order.delivery.name;
				input_c.value = order.total_order_amount;
				input_d.value = order.total_order_amount;

				userData.totals.subtotal = input_d;

				break;
			case 1:

				label_a.textContent = "仕入先コード";
				label_b.textContent = "納品先住所";
				label_c.textContent = "消費税";
				label_d.textContent = "消費税(確定)";

				input_a.value = order.supplier.code;
				input_b.value = order.delivery.address;
				input_c.value = "";
				input_d.value = "";

				userData.totals.sales_tax = input_d;

				break;
			case 2:

				label_a.textContent = "仕入先名";
				label_b.textContent = "納品先電話番号";
				label_c.textContent = "合計金額";
				label_d.textContent = "合計金額(確定)";

				input_a.value = order.supplier.name;
				input_b.value = order.delivery.tel;
				input_c.value = "";
				input_d.value = "";
				
				userData.totals.total = input_d;

				break;
			}

		}

		div.appendChild(table);
		return div;

	}

	function api_createProducts(order, userData) {

		const div = document.createElement("div");
		div.setAttribute("class", "products");

		const table = document.createElement("table");

		// Thead

		const thead = document.createElement("thead");
		let row_1 = thead.insertRow();
		
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
		const th_a = document.createElement("th");
		const th_b = document.createElement("th");
		const th_c = document.createElement("th");

		th_0.textContent = "No.";
		th_1.textContent = "商品番号";
		th_2.textContent = "商品名";
		th_3.textContent = "JANコード1";
		th_4.textContent = "JANコード2";
		th_5.textContent = "メーカー型番";
		th_6.textContent = "取引先品番";
		th_7.textContent = "数量";
		th_8.textContent = "単位";
		th_9.textContent = "単価 Master";
		th_a.textContent = "単価 EDI";
		th_b.textContent = "合計";
		th_c.textContent = "個口数";

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
		th_a.setAttribute("class", "j");
		th_b.setAttribute("class", "k");
		th_c.setAttribute("class", "l");

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
		row_1.appendChild(th_a);
		row_1.appendChild(th_b);
		row_1.appendChild(th_c);

		// Tbody

		const tbody = document.createElement("thead");

		for(let i = 0; i < order.details.length; i++) {

			row_1 = thead.insertRow();

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
			let td_a = row_1.insertCell();
			let td_b = row_1.insertCell();
			let td_c = row_1.insertCell();

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
			td_a.setAttribute('class', 'j');
			td_b.setAttribute('class', 'k');
			td_c.setAttribute('class', 'l');

			let input_0 = document.createElement("input");
			let input_1 = document.createElement("input");
			let input_2 = document.createElement("input");
			let input_3 = document.createElement("input");
			let input_4 = document.createElement("input");
			let input_5 = document.createElement("input");
			let input_6 = document.createElement("input");
			let input_7 = document.createElement("input");
			let input_8 = document.createElement("input");
			let input_9 = document.createElement("input");
			let input_a = document.createElement("input");
			let input_b = document.createElement("input");
			let input_c = document.createElement("input");
			
			input_0.setAttribute('type', 'text');
			input_1.setAttribute('type', 'text');
			input_2.setAttribute('type', 'text');
			input_3.setAttribute('type', 'text');
			input_4.setAttribute('type', 'text');
			input_5.setAttribute('type', 'text');
			input_6.setAttribute('type', 'text');
			input_7.setAttribute('type', 'text');
			input_8.setAttribute('type', 'text');
			input_9.setAttribute('type', 'text');
			input_a.setAttribute('type', 'text');
			input_b.setAttribute('type', 'text');
			input_c.setAttribute('type', 'text');

			input_0.setAttribute('readonly', 'readonly');
			input_1.setAttribute('readonly', 'readonly');
			input_2.setAttribute('readonly', 'readonly');
			input_3.setAttribute('readonly', 'readonly');
			input_4.setAttribute('readonly', 'readonly');
			input_5.setAttribute('readonly', 'readonly');
			input_6.setAttribute('readonly', 'readonly');
			input_7.setAttribute('readonly', 'readonly');
			input_8.setAttribute('readonly', 'readonly');
			input_9.setAttribute('readonly', 'readonly');
			input_a.setAttribute('readonly', 'readonly');
			input_b.setAttribute('readonly', 'readonly');

			input_0.setAttribute("data-index", "0");
			input_1.setAttribute("data-index", "1");
			input_2.setAttribute("data-index", "2");
			input_3.setAttribute("data-index", "3");
			input_4.setAttribute("data-index", "4");
			input_5.setAttribute("data-index", "5");
			input_6.setAttribute("data-index", "6");
			input_7.setAttribute("data-index", "7");
			input_8.setAttribute("data-index", "8");
			input_9.setAttribute("data-index", "9");
			input_a.setAttribute("data-index", "a");
			input_b.setAttribute("data-index", "b");
			input_c.setAttribute("data-index", "c");
			input_c.setAttribute("placeholder", "個口数");

			td_0.appendChild(input_0);
			td_1.appendChild(input_1);
			td_2.appendChild(input_2);
			td_3.appendChild(input_3);
			td_4.appendChild(input_4);
			td_5.appendChild(input_5);
			td_6.appendChild(input_6);
			td_7.appendChild(input_7);
			td_8.appendChild(input_8);
			td_b.appendChild(input_b);
			td_c.appendChild(input_c);

			const label1 = document.createElement("label");
			const label2 = document.createElement("label");
			
			let radio_name = Math.random().toString(36).substring(7);
			const radio1 = document.createElement("input");
			const radio2 = document.createElement("input");

			const localData = {
				data : order.details[i]
			};

			radio1.setAttribute("type", "radio");
			radio2.setAttribute("type", "radio");
			radio1.setAttribute("name", radio_name);
			radio2.setAttribute("name", radio_name);

			radio1.localData = localData;
			radio2.localData = localData;
			
			localData.radio = [ radio1, radio2 ];

			radio1.addEventListener('change', this.EVT.handlePriceRadioChange);
			radio2.addEventListener('change', this.EVT.handlePriceRadioChange);

			label1.appendChild(radio1);
			label2.appendChild(radio2);

			label1.appendChild(input_9);
			label2.appendChild(input_a);
			input_9.setAttribute("placeholder", "マスター単価");

			td_9.appendChild(label1);
			td_a.appendChild(label2);

			let codeFound = null;
			let needle = order.details[i].manufacturer_model_number;
			for(let k = 0; k < this.MEM.products.length; k++) {
				let p = this.MEM.products[k];
				if(p.my_company_code !== needle) {
					continue;
				}
				codeFound = p;
				break;
			}

			input_9.addEventListener('click', this.EVT.handleInputClick);
			input_a.addEventListener('click', this.EVT.handleInputClick);

			input_0.value = order.details[i].detail_line_number;
			input_1.value = order.details[i].product_code;
			input_2.value = order.details[i].product_name;
			input_3.value = order.details[i].jan_code1;
			input_4.value = order.details[i].jan_code2;
			input_5.value = order.details[i].manufacturer_model_number;
			input_6.value = order.details[i].supplier_part_number;
			input_7.value = order.details[i].quantity;
			input_8.value = order.details[i].unit;
			input_c.value = order.details[i].quantity;
			order.details[i].case_quantity = order.details[i].quantity;
			order.details[i].my_company_code = "";

			input_c.addEventListener('input', this.EVT.handleQuantityChange);
			input_c.localData = order.details[i];

			input_5.setAttribute("class", "code");
			input_5.setAttribute("placeholder", "商品コード");
			input_5.addEventListener('keydown', this.EVT.handleInputKeyDown);
			input_5.localData = localData;
			input_5.userData = userData;
			localData.code = input_5;

			localData.price_display = input_9;

			if(codeFound) {
				
				input_9.value = codeFound.forest_price;
				order.details[i].my_company_code = codeFound.my_company_code;
					
				localData.price = [
					codeFound.forest_price,
					order.details[i].price
				];

				if(codeFound.forest_price === order.details[i].price) {
					radio1.setAttribute("disabled", "disabled");
					radio2.setAttribute("disabled", "disabled");
					input_9.setAttribute("disabled", "disabled");
					radio2.checked = true;
				} else {

					td_9.classList.add("warn");
					td_a.classList.add("warn");
				}

			} else {

				input_5.removeAttribute("readonly");
				td_9.classList.add("error");
				td_a.classList.add("error");
				radio1.setAttribute("disabled", "disabled");
				radio2.setAttribute("disabled", "disabled");

			}

			input_a.value = order.details[i].price;
			input_b.value = order.details[i].total;
			localData.input = input_b;

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

		th_0.textContent = "特記欄";
		th_1.textContent = "予備項目１";
		th_2.textContent = "予備項目２";
		th_3.textContent = "予備項目３";
		th_4.textContent = "予備項目４";
		th_5.textContent = "予備項目５";

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

		input_0.value = order.special_column;

		input_1.value = order.reserved.note1;
		input_2.value = order.reserved.note2;
		input_3.value = order.reserved.note3;
		input_4.value = order.reserved.note4;
		input_5.value = order.reserved.note5;

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

	function api_processCsv(content) {

		const processed = [];

		for(let i = 0; i < content.length; i++) {

			const item = {};
			const parts = content[i].split(",");
			
			// 連番
			item.local_serial = parts.shift();

			item.supplier = {
				// 取引先当社ID
				company_id : parts.shift(),
				// 仕入先コード
				code : parts.shift(),
				// 仕入先名
				name : parts.shift() 
			}

			// 発注区分
			item.order_classification = parts.shift();

			// 発注日
			let date = parts.shift(); 
			let dd = date.split("/");
			if(dd[1].length < 2) {
				dd[1] = "0" + dd[1];
			}
			if(dd[2].length < 2) {
				dd[2] = "0" + dd[2];
			}
			item.order_date = dd.join("-");

			// 発注No.
			item.order_no = parts.shift(); 
			// 発注合計金額（税抜）
			item.total_order_amount = parts.shift();

			// 納品先
			item.delivery = {
				// 納品先住所
				address : parts.shift(),
				// 納品先名
				name : parts.shift(),
				// 納品先倉庫コード
				warehouse_code : parts.shift(),
				// 納品先電話番号
				tel : parts.shift().replace(/'/g, '')
			}
			
			item.details = [];

			const detail = {
				// 明細行番号
				detail_line_number : parts.shift(),
				// 商品番号
				product_code : parts.shift(),
				// 商品名
				product_name : parts.shift(),
				// JANコード1
				jan_code1 : parts.shift(),
				// JANコード2
				jan_code2 : parts.shift(), 
				// メーカー型番
				manufacturer_model_number : parts.shift(),
				// 取引先品番
				supplier_part_number : parts.shift(),
				// 数量
				quantity : parts.shift(),
				// 単位
				unit : parts.shift(),
				// 単価
				price : parts.shift(),
				// 合計
				total : parts.shift() 
			}
			
			let found = false;
			for(let k = 0; k < processed.length; k++) {
				if(processed[k].order_no !== item.order_no) {
					continue;
				}

				processed[k].details.push(detail);
				found = true;
				break;
			}

			if(found) {
				continue;
			}

			item.details.push(detail);

			// 指定納期
			date = parts.shift(); 
			dd = date.split("/");
			if(dd[1].length < 2) {
				dd[1] = "0" + dd[1];
			}
			if(dd[2].length < 2) {
				dd[2] = "0" + dd[2];
			}
			item.designated_delivery_date = dd.join("-"); 

			// 納期回答
			item.delivery_response = parts.shift(); 
			// 特記欄
			item.special_column = parts.shift(); 

			item.reserved = {
				// 予備項目１
				note1 : parts.shift(),
				// 予備項目２
				note2 : parts.shift(), 
				// 予備項目３
				note3 : parts.shift(), 
				// 予備項目４
				note4 : parts.shift(), 
				// 予備項目５
				note5 : parts.shift() 
			}

			processed.push(item);

		}

		return processed;

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



}).apply({});

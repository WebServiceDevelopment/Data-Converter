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

import {
	api_implementSearch,
	api_resetCheckList,
} from "../js/c400_api_module.js";

import {
	api_renderHistoryMeta,
	api_renderHistoryBody,
	api_renderHistoryFoot,
	api_renderHistoryItem
} from "../js/c400_api_history.js";

import {
	api_createWsdFormat,
	api_createSendFormatFix,
	api_createSendFormat
} from "../js/c400_api_format.js";

import {
	api_processOrder,
	api_renderOrders,
	api_createTopRow,
	api_checkForFix,
	api_createShipping
} from "../js/c400_api_order.js";

import {
	api_createProducts,
	api_matchProductCode
} from "../js/c400_api_products.js";

import {
	api_displayFixes,
	api_selectFixes,
	api_registerFixes
} from "../js/c400_api_fixes.js";

import {
	api_analysisPdfText,
} from "../js/c400_api_analysisPdfText.js";

import {
	api_storePdf,
	api_readPdfFile
} from "../js/c400_api_io.js";

import {
	pdf_utsumi,
	pdf_wsd,
} from "../js/c400_api_pdf.js";

const C400 = (function() {

	this.MEM = {
		enter : 0,
		checkboxes : []
	}

	this.DOM = {
		document : document.getElementById('C300.document'),
		table : document.getElementById('C300.table'),
		edi : {
			pdf	: document.getElementById('C400.edi.pdf'),
			preview : document.getElementById('C400.edi.preview'),
			file	: document.getElementById('C400.edi.file'),
			csv	: document.getElementById('C400.edi.csv'),
			fixed	: document.getElementById('C400.edi.fixed'),
			textarea : document.getElementById('C400.edi.textarea'),
			sjis	: document.getElementById('C400.edi.sjis'),
			utf8	: document.getElementById('C400.edi.utf8'),
			yes_comments : document.getElementById('C400.edi.yes_comments'),
			no_comments : document.getElementById('C400.edi.no_comments'),
			clear	: document.getElementById('C400.edi.clear'),
			fmt_send : document.getElementById('C400.edi.fmt_send'),
			fmt_wsd : document.getElementById('C400.edi.fmt_wsd'),
			filename : document.getElementById('C400.edi.filename'),
			yes_skip : document.getElementById('C400.edi.yes_skip'),
			no_skip : document.getElementById('C400.edi.no_skip'),
			download : document.getElementById('C400.edi.download')
		},
		history : {
			list	: document.getElementById('C400.history.list'),
			reset	: document.getElementById('C400.history.reset'),
			back	: document.getElementById('C400.history.back'),
			input	: document.getElementById('C400.history.input'),
			search	: document.getElementById('C400.history.search'),
			select	: document.getElementById('C400.history.select')
		}
	}

	this.EVT = {
		handlePdfDrop : evt_handlePdfDrop.bind(this),
		handlePdfDragEnter : evt_handlePdfDragEnter.bind(this),
		handlePdfDragLeave : evt_handlePdfDragLeave.bind(this),
		handlePdfDragOver : evt_handlePdfDragOver.bind(this),
		handlePdfChange : evt_handlePdfChange.bind(this),
		handlePdfClick : evt_handlePdfClick.bind(this),
		handleCsvClick : evt_handleCsvClick.bind(this),
		handleCheckboxChange : evt_handleCheckboxChange.bind(this),
		hanleRadioChange : evt_hanleRadioChange.bind(this),
		handleClearClick : evt_handleClearClick.bind(this),
		handleCustomerClick : evt_handleCustomerClick.bind(this),
		handleSpanClick : evt_handleSpanClick.bind(this),
		handleLinkClick : evt_handleLinkClick.bind(this),
		handleHistoryBackClick : evt_handleHistoryBackClick.bind(this),
		handleHistorySearch : evt_handleHistorySearch.bind(this),
		handleSelectChange : evt_handleSelectChange.bind(this),
		updateRadio : evt_updateRadio.bind(this),
		handleRadioPriceChange : evt_handleRadioPriceChange.bind(this),
		handleInputPriceKey : evt_handleInputPriceKey.bind(this),
		handleCodeFocus : evt_handleCodeFocus.bind(this),
		handleCodeBlur : evt_handleCodeBlur.bind(this),
		handleOptionClick : evt_handleOptionClick.bind(this),
		handleLockClick : evt_handleLockClick.bind(this),
		handleDownloadClick : evt_handleDownloadClick.bind(this),
		handleFixedClick : evt_handleFixedClick.bind(this)
	}

	this.API = {
		readPdfFile	: api_readPdfFile.bind(this),
		readFileBinary	: api_readFileBinary.bind(this),
		readFileText	: api_readFileText.bind(this),
		analysisPdfText : api_analysisPdfText.bind(this),
		arrayBufferToBase64 : api_arrayBufferToBase64.bind(this),
		processOrder	: api_processOrder.bind(this),
		renderOrders	: api_renderOrders.bind(this),
		createTopRow	: api_createTopRow.bind(this),
		createShipping	: api_createShipping.bind(this),
		createProducts	: api_createProducts.bind(this),
		prepareZip	: api_prepareZip.bind(this),
		createCsv	: api_createCsv.bind(this),
		createWsdFormat : api_createWsdFormat.bind(this),
		createSendFormat : api_createSendFormat.bind(this),
		createSendFormatFix : api_createSendFormatFix.bind(this),
		storePdf	: api_storePdf.bind(this),
		checkForFix	: api_checkForFix.bind(this),
		renderHistoryItem : api_renderHistoryItem.bind(this),
		renderHistoryMeta : api_renderHistoryMeta.bind(this),
		renderHistoryBody : api_renderHistoryBody.bind(this),
		renderHistoryFoot : api_renderHistoryFoot.bind(this),
		registerFixes	: api_registerFixes.bind(this),
		selectFixes	: api_selectFixes.bind(this),
		numHalfToFull	: api_numHalfToFull.bind(this),
		numFullToHalf	: api_numFullToHalf.bind(this),
		fullToDate	: api_fullToDate.bind(this),
		checkForRemove	: api_checkForRemove.bind(this),
		checkForUpdate	: api_checkForUpdate.bind(this),
		implementSearch : api_implementSearch.bind(this),
		displayFixes	: api_displayFixes.bind(this),
		resetCheckList	: api_resetCheckList.bind(this),
		matchProductCode : api_matchProductCode.bind(this),
		handleProcessed	: api_handleProcessed.bind(this),
		storeIpfs	: api_storeIpfs.bind(this)
	}
	this.PDF = {
		utsumi	: pdf_utsumi.bind(this),
		wsd	: pdf_wsd.bind(this),
	}

	init.apply(this);
	return this;

	function init() {
		let edi = this.DOM.edi;
		let history = this.DOM.history;
		let EVT = this.EVT;

		edi.pdf.addEventListener('drop', EVT.handlePdfDrop);
		edi.pdf.addEventListener('dragenter', EVT.handlePdfDragEnter);
		edi.pdf.addEventListener('dragleave', EVT.handlePdfDragLeave);
		edi.pdf.addEventListener('dragover', EVT.handlePdfDragOver);
		edi.file.addEventListener('change', EVT.handlePdfChange);
		edi.pdf.addEventListener('click', EVT.handlePdfClick);
		edi.csv.addEventListener('click', EVT.handleCsvClick);
		edi.fixed.addEventListener('click', EVT.handleFixedClick);

		edi.yes_comments.addEventListener('change', EVT.hanleRadioChange);
		edi.no_comments.addEventListener('change', EVT.hanleRadioChange);
		edi.fmt_send.addEventListener('change', EVT.hanleRadioChange);
		edi.fmt_wsd.addEventListener('change', EVT.hanleRadioChange);
		edi.yes_skip.addEventListener('change', EVT.hanleRadioChange);
		edi.no_skip.addEventListener('change', EVT.hanleRadioChange);

		edi.clear.addEventListener('click', EVT.handleClearClick);

		edi.textarea.value = "";
		edi.filename.value = "";

		history.back.addEventListener('click', EVT.handleHistoryBackClick);
		history.search.addEventListener('click', EVT.handleHistorySearch);
		history.select.addEventListener('change', EVT.handleSelectChange);
		edi.download.addEventListener('click', EVT.handleDownloadClick);

		edi.csv.setAttribute('disabled', 'disabled');
		edi.fixed.setAttribute('disabled', 'disabled');


		setTimeout(function () {
			let elm = document.getElementById('C400.main');
			elm.style.visibility = "visible";
		},1000);
	}

	async function evt_handleFixedClick() {

		const SKIP_KEYS = [ 'hash', 'order_uuid' ];
		const clonedOrders = [];
		this.MEM.checkboxes.forEach( (checkbox) => {
			
			const order = checkbox.userData;
			if(order.label) {
				return;
			}

			const clonedOrder = {
				checked : checkbox.checked
			};

			for(let key in order) {

				if(order[key] instanceof HTMLElement) {
					continue;
				}

				if(SKIP_KEYS.indexOf(key) !== -1) {
					continue;
				}

				clonedOrder[key] = order[key];
				clonedOrders.push(clonedOrder);
			}
		});
		
		const params = {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify(clonedOrders)
		}

		const req = await fetch('/utsumi/processed_data', params);
		const res = await req.json();

		this.DOM.edi.csv.removeAttribute('disabled');

	}


	function evt_handleDownloadClick() {

		const orders = [];
		this.MEM.checkboxes.forEach(box => {
				
			if(!box.checked) {
				return;
			}

			const order = box.userData;
			if(order.label) {
				return;
			}

			const clone = {};
			for(let key in order) {
				
				switch(key) {
				case 'li':
				case 'link':
				case 'parent':
					continue;
					break;
				default:
					clone[key] = order[key];
					break;
				}
			}

			orders.push(clone);

		});
		
		let json_text = JSON.stringify(orders, null, 4);
		let blob = new Blob([ json_text ] , {type: "text/plain"});
		saveAs(blob, "json_data.json");

	}

	function evt_handleLockClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let lockIcon = userData.lockIcon;
		if(lockIcon.classList.contains('closed')) {
			lockIcon.classList.remove('closed');
			lockIcon.classList.add('open');
			userData.parentCheckbox.removeAttribute('disabled');
			userData.members.forEach( checkbox => {
				checkbox.removeAttribute('disabled');
			});
		} else {
			lockIcon.classList.remove('open');
			lockIcon.classList.add('closed');
			userData.parentCheckbox.setAttribute('disabled', 'disabled');
			userData.members.forEach( checkbox => {
				checkbox.setAttribute('disabled', 'disabled');
			});
		}

	}

	function evt_handleOptionClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}
		
		let code = userData.info.my_company_code;
		userData.ref.code.value = code;
		this.API.matchProductCode(userData.ref);

	}

	function evt_handleCodeFocus(evt) {

		let elem = evt.target;
		if(elem.getAttribute("readonly")) {
			return;
		}

		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.rel.classList.add("open");

	}
	
	function evt_handleCodeBlur(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		setTimeout( () => {
			userData.rel.classList.remove("open");
		}, 200);

	}

	function evt_handleInputPriceKey(evt) {

		const ENTER_KEY = 13;
		if(evt.keyCode !== 13) {
			return;
		}

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		this.API.matchProductCode(userData);

	}


	function evt_handleRadioPriceChange(evt) {

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

		let count = parseInt(userData.data.count);
		let subtotal = (price * count).toString();
		userData.input.value = subtotal;
		userData.data.price = price.toString();
		userData.data.subtotal = subtotal;
		this.API.createCsv();

	}

	function evt_updateRadio(evt) {

		let elem = evt.target;
		let radio = elem.previousSibling;

		if(radio.getAttribute("disabled")) {
			return;
		}

		radio.checked = true;
		this.EVT.handleRadioPriceChange({target : radio});

	}

	function evt_handleSelectChange() {

		switch(this.DOM.history.select.value) {
		case 'order_no':
			this.DOM.history.input.setAttribute("placeholder", "注文No.");
			break;
		case 'customer_no':	
			this.DOM.history.input.setAttribute("placeholder", "得意先No.");
			break;
		}

	}

	async function evt_handleHistorySearch(evt) {

		this.API.implementSearch();

	}

/*
* 得意先No.選択後表示する戻るボタン
*
*/
	function evt_handleHistoryBackClick(evt) {

		this.DOM.history.reset.classList.add("hide");
		this.DOM.history.list.innerHTML = "";
		this.DOM.history.input.value = "";
		this.API.resetCheckList();

	}

	function evt_handleLinkClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		userData.scrollIntoView({
			behavior: "smooth", 
			block: "start", 
			inline: "nearest"
		});

		let e = userData;
		while(e.parentNode && e.tagName !== "LI") {
			e = e.parentNode;
		}
		
		e.classList.add("highlight");
		setTimeout( () => {
			e.classList.remove("highlight");
		}, 4000);

	}

	async function evt_handleSpanClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		let order = userData.order;
		let fix = userData.fix;

		this.DOM.history.input.value = "Fix: " + fix.invalid_order_no;
		this.DOM.history.select.value = "order_no";
		this.API.implementSearch();

	}

	async function evt_handleCustomerClick(evt) {
		
		let elem = evt.target;
		let customer_no = elem.value;

		this.DOM.history.select.value = "customer_no";
		this.DOM.history.input.value = customer_no;
		this.API.implementSearch();

	}

	function evt_handleClearClick() {
		
		// Clear UI

		this.DOM.edi.preview.innerHTML = "";
		this.DOM.edi.textarea.value = "";
		
		// Set export buttons disabled

		this.DOM.edi.csv.setAttribute('disabled', 'disabled');
		this.DOM.edi.fixed.setAttribute('disabled', 'disabled');
		
		// Clear Module Memory

		this.MEM = {};

	}

	function evt_hanleRadioChange() {

		this.API.createCsv();

	}

/*
* 注文書のバーの右側にあるチェックボックス
*/
	function evt_handleCheckboxChange(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(userData.label) {
			
			if(elem.checked) {
				userData.members.forEach( c => {
					c.checked = true;
				});
			} else {
				userData.members.forEach( c => {
					c.checked = false;
				});
			}

		} else {
			
			elem = userData.parent;
			userData = elem.userData;

			let count = 0;
			userData.members.forEach( c => {
				if(!c.checked) {
					return;
				}
				count++;
			});

			elem.checked = count;

		}

		this.API.createCsv();

	}

	function api_createCsv() {
		
		// Disable Export Button everytime CSV
		// is re-generated, (means there are unconfirmed fixes)

		this.DOM.edi.csv.setAttribute('disabled', 'disabled');

		this.API.createSendFormatFix();

		/*
		if(this.DOM.edi.fmt_send.checked) {

			// this.API.createSendFormat();
			this.API.createSendFormatFix();

		} else if(this.DOM.edi.fmt_wsd.checked) {

			this.API.createWsdFormat();

		} else {
			
			console.log("something has gone wrong!!");

		}
		*/

	}

	async function api_prepareZip(list) {
		
		/*
		let zip = new JSZip();
		for(let i = 0; i < list.length; i++) {
			zip.file("order_" + i + ".json", JSON.stringify(list[i], null, 4));
		}

		this.MEM.blob = await zip.generateAsync({type:"blob"})
		*/

	}

	async function evt_handleCsvClick() {


		// saveAs(this.MEM.blob, "content.zip");

		if(this.DOM.edi.textarea.value.length === 0) {
			return;
		}

		const orders = [];
		this.MEM.checkboxes.forEach( checkbox => {

			const userData = checkbox.userData;
			if(userData.label) {
				return;
			}

			const clone = {};
			clone.checked = checkbox.checked ? 1 : 0;

			for(let key in userData) {
				if(userData[key] instanceof HTMLElement) {
					continue;
				}
				let str = JSON.stringify(userData[key]);
				clone[key] = JSON.parse(str);
			}

			orders.push(clone);

		});
		

		const keyword = this.DOM.edi.textarea.value;
		if(this.DOM.edi.sjis.checked) {
			
			const unicodeArray = [];
			for (let i = 0; i < keyword.length; i++) {
				unicodeArray.push(keyword.charCodeAt(i));
			}

			const sjisArray = Encoding.convert(unicodeArray, {
				to: 'SJIS',
				from: 'UNICODE',
			});

			let buffer = new Uint8Array(sjisArray);
			let blob = new Blob([ buffer ] , {type: "text/plain"});
			saveAs(blob, this.DOM.edi.filename.value);


		} else {

			let blob = new Blob([ keyword ] , {type: "text/plain"});
			saveAs(blob, this.DOM.edi.filename.value);

		}

	}

	function evt_handlePdfClick(evt) {

		this.DOM.edi.file.click();

	}

	function evt_handlePdfChange(evt) {

		let files = evt.target.files;
		this.API.readPdfFile(files);

	}

	async function evt_handlePdfDrop(evt) {

		evt.stopPropagation();
		evt.preventDefault();
		this.DOM.edi.pdf.classList.remove("over");

		let files = evt.dataTransfer.files;
		this.API.readPdfFile(files);

	}

	function evt_handlePdfDragEnter(evt) {

		this.DOM.edi.pdf.classList.add("over");
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handlePdfDragLeave(evt) {

		this.DOM.edi.pdf.classList.remove("over");
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handlePdfDragOver(evt) {

		evt.stopPropagation();
		evt.preventDefault();

	}

	function api_readFileText(file) {

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

	async function api_storeIpfs(processed, file) {

		//console.log('jump b');
		const clone = JSON.parse(JSON.stringify(processed));

		const data = clone.filter( (item) => {
			return !item.hasOwnProperty('title');
		}).map( (item) => {
			delete item.li;
			delete item.link;
			delete item.parent;
			delete item.hash;
			return item;
		});

		//console.log(data);

		const form = new FormData();
		form.append('pdf', file);
		form.append('data', JSON.stringify(data));

		const req = await fetch('/ipfs/set', {
			method : 'POST',
			body : form
		});

		const res = await req.text();
		//console.log(res);

		//console.log(processed);
		//console.log(file);

	}


	async function api_handleProcessed(processed) {

		try {
			const req = await fetch('/utsumi/selectProducts', {method: 'POST'});
			this.MEM.products = await req.json();
		} catch(err) {
			alert('Utsumi Error 406\nWSDに連略してください');
			throw err;
		}
			
		for(let i = 0; i < processed.length; i++) {
			let order = processed[i];

			if(!order || !order.recipient) {
				continue;
			}

			await this.API.checkForRemove(order);
			await this.API.checkForUpdate(order);
		}

		let fixes = await this.API.selectFixes(processed);
		this.MEM.fixes = fixes;

		this.API.storePdf(processed);
		this.API.renderOrders(processed);
		this.API.createCsv(processed);

	}

	function api_numHalfToFull(source) {

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

	function api_fullToDate(str) {

		let parts = str.split("／");

		let month = this.API.numFullToHalf(parts[0]);
		let day = this.API.numFullToHalf(parts[1]);

		month = month.toString();
		day = day.toString();

		if(month.length < 2) {
			month = "0" + month;
		}

		if(day.length < 2) {
			day = "0" + day;
		}

		return "%" + month + "-" + day;

	}

	function api_checkForRemove(order) {

		return new Promise ( async (resolve, reject) => {

			let points = 0;

			if(order.recipient.addr.indexOf("訂正") !== -1) {
				points++;
			}

			let parts = order.recipient.addr.split("：");
			if(parts.length === 3) {
				points++;
			}

			if(!parts[1]) {
				return resolve();
			}

			if(parts[1].indexOf("整理Ｎｏ．") !== -1) {
				points++;
			}

			for(let i = 0; i < order.products.length; i++) {
				if(parseInt(order.products[i].count) >= 0) {
					continue;
				}
				points++;
				break;
			}
			
			if( points < 3) {
				return resolve();
			}
			
			parts[1] = parts[1].replace(/．/g, '');
			const customer_no = order.customer_no;

			const invalid = {
				date : this.API.numFullToHalf(parts[0]),
				order_no : this.API.numFullToHalf(parts[1]),
				reference_no : this.API.numFullToHalf(parts[2]),
			}

			const remove = {
				date : order.order_date,
				order_no : order.order_no,
				reference_no : order.reference_no
			}
			
			let data;

			const params = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body : JSON.stringify({
					customer_no,
					invalid,
					remove
				})
			}

			try {
				data = await fetch('/utsumi/registerRemove', params);
			} catch(err) {
				alert('Utsumi Error 408\nWSDに連略してください');
				throw err;
			}

			resolve();

		});

	}

	function api_checkForUpdate(order) {

		return new Promise ( async (resolve, reject) => {
			
			let points = 0;

			if(order.notes.indexOf("訂正") !== -1) {
				points++;
			}

			if(order.notes.indexOf("変更") !== -1) {
				points++;
			}

			if(order.notes.indexOf("ＮＯ") !== -1) {
				points++;
			}

			if(order.notes.indexOf("Ｎｏ") !== -1) {
				points++;
			}

			if(points < 2) {
				return resolve();
			}
		

			let str = order.notes.replace(/．/g, '');
			let parts = str.split("Ｎ");

			const query = {
				customer_no : order.customer_no,
				order_no : this.API.numFullToHalf(parts[1]),
				date : this.API.fullToDate(parts[0])
			};

			const update = {
				date : order.order_date,
				order_no : order.order_no,
				reference_no : order.reference_no
			}

			//console.log( query );
			//console.log( update );

			let data;

			const params = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body : JSON.stringify({
					query,
					update
				})
			}

			try {
				data = await fetch('/utsumi/registerUpdate', params);
			} catch(err) {
				alert('Utsumi Error 409\nWSDに連略してください');
				throw err;
			}
			
			resolve();

		});

	}


	function api_arrayBufferToBase64( buffer ) {
		
		let binary = '';
		let bytes = new Uint8Array( buffer );
		let len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		
		let str = window.btoa( binary );
		return str;

	}


}).apply({});

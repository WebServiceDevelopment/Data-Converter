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

'use strict';

const Search = (function() {

	this.MEM = {
		date:0,
		}

	this.DOM = {
		toolbar : {
			system : document.getElementById('Search.toolbar.system'),
			order_date_start : document.getElementById('Search.toolbar.order_date_start'),
			order_date_end : document.getElementById('Search.toolbar.order_date_end'),
			delivery_date_start : document.getElementById('Search.toolbar.delivery_date_start'),
			delivery_date_end : document.getElementById('Search.toolbar.delivery_date_end'),
			amount_min : document.getElementById('Search.toolbar.amount_min'),
			amount_max : document.getElementById('Search.toolbar.amount_max'),
			customer : document.getElementById('Search.toolbar.customer'),
			count : document.getElementById('Search.toolbar.count'), 
			submit : document.getElementById('Search.toolbar.submit'), 
			confirm_total : document.getElementById('Search.toolbar.confirm_total'),
			order_total : document.getElementById('Search.toolbar.order_total'),
		},
		header : {
			order : document.getElementById('Search.header.order'),
			order_tooltip : document.getElementById('Search.header.order.tooltip'),
			amount : document.getElementById('Search.header.amount'),
			amount_tooltip : document.getElementById('Search.header.amount.tooltip'),
			confirm : document.getElementById('Search.header.confirm'),
			confirm_tooltip : document.getElementById('Search.header.confirm.tooltip'),
			ipfs_or_csv : document.getElementById('Search.header.ipfs_or_csv'),
			ipfs_or_csv_tooltip : document.getElementById('Search.header.ipfs_or_csv.tooltip'),
		},
		results : {
			table : document.getElementById('Search.results.table')
		},
		order_delivery: document.getElementsByName( "order_delivery" ),
		up_down: document.getElementsByName( "up_down" )
	}

	this.EVT = {
		handleSearchSubmit : evt_handleSearchSubmit.bind(this),
		handleIpfsDownload : evt_handleIpfsDownload.bind(this),
		handleSrcDownload : evt_handleSrcDownload.bind(this),
		handleDstDownload : evt_handleDstDownload.bind(this),
		order_delivery : evt_order_delivery.bind(this),
		up_down : evt_up_down.bind(this),
		date_change : evt_date_change.bind(this),
	}

	this.TIP = {
		amount_mouseover : tip_amount_mouseover.bind(this),
		amount_mouseout : tip_amount_mouseout.bind(this),
		order_mouseover : tip_order_mouseover.bind(this),
		order_mouseout : tip_order_mouseout.bind(this),
		confirm_mouseover : tip_confirm_mouseover.bind(this),
		confirm_mouseout : tip_confirm_mouseout.bind(this),
		ipfs_mouseover : tip_ipfs_mouseover.bind(this),
		ipfs_mouseout : tip_ipfs_mouseout.bind(this),
	}

	this.API = {
		executeSearch : api_executeSearch.bind(this),
		renderResults : api_renderResults.bind(this),
		getToday : api_getToday.bind(this),
		getDay : api_getDay.bind(this),
	}

	init.apply(this);
	return this;

	function tip_amount_mouseover(e) {
		let elm = this.DOM.header.amount_tooltip;
		elm.style.display = "";
	}

	function tip_amount_mouseout(e) {
		let elm = this.DOM.header.amount_tooltip;
		elm.style.display = "none";
	}

	function tip_order_mouseover(e) {
		let elm = this.DOM.header.order_tooltip;
		elm.style.display = "";
	}

	function tip_order_mouseout(e) {
		let elm = this.DOM.header.order_tooltip;
		elm.style.display = "none";
	}

	function tip_confirm_mouseover(e) {
		let elm = this.DOM.header.confirm_tooltip;
		elm.style.display = "";
	}

	function tip_confirm_mouseout(e) {
		let elm = this.DOM.header.confirm_tooltip;
		elm.style.display = "none";
	}

	function tip_ipfs_mouseover(e) {
		let elm = this.DOM.header.ipfs_or_csv_tooltip;
		elm.style.display = "";
	}

	function tip_ipfs_mouseout(e) {
		let elm = this.DOM.header.ipfs_or_csv_tooltip;
		elm.style.display = "none";
	}

	function init() {
		
		this.DOM.toolbar.submit.addEventListener('click', this.EVT.handleSearchSubmit);

		const today = this.API.getToday();
                this.DOM.toolbar.order_date_end.value = today;
                this.DOM.toolbar.order_date_start.value = today;
                this.DOM.order_delivery[0].checked = true;
		
		this.MEM.date = 0;

		this.DOM.order_delivery[0].addEventListener('click', this.EVT.order_delivery);
		this.DOM.order_delivery[1].addEventListener('click', this.EVT.order_delivery);

		const l = this.DOM.up_down.length;
		for(let i=0; i<l;i++) {
			this.DOM.up_down[i].addEventListener('click', this.EVT.up_down);
		}
		this.DOM.toolbar.order_date_start.addEventListener('change', this.EVT.date_change.bind(this, "order_up"));
		this.DOM.toolbar.delivery_date_start.addEventListener('change', this.EVT.date_change.bind(this, "delivery_up"));

		this.DOM.toolbar.confirm_total.innerText = 0;
		this.DOM.toolbar.order_total.innerText = 0;


		this.DOM.header.amount.addEventListener('mouseover', this.TIP.amount_mouseover);
		this.DOM.header.amount.addEventListener('mouseout', this.TIP.amount_mouseout);
		this.TIP.amount_mouseout();

		this.DOM.header.order.addEventListener('mouseover', this.TIP.order_mouseover);
		this.DOM.header.order.addEventListener('mouseout', this.TIP.order_mouseout);
		this.TIP.order_mouseout();

		this.DOM.header.confirm.addEventListener('mouseover', this.TIP.confirm_mouseover);
		this.DOM.header.confirm.addEventListener('mouseout', this.TIP.confirm_mouseout);
		this.TIP.confirm_mouseout();

		this.DOM.header.ipfs_or_csv.addEventListener('mouseover', this.TIP.ipfs_mouseover);
		this.DOM.header.ipfs_or_csv.addEventListener('mouseout', this.TIP.ipfs_mouseout);
		this.TIP.ipfs_mouseout();

		
		setTimeout(function () {
			let elm = document.getElementById('search.main');
			elm.style.visibility = "visible";
		},1000);
	}

	async function evt_handleSrcDownload(evt) {

		const elem = evt.target;
		const { order_source, order_no, order_date } = elem.userData;

		const params = {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				order_source,
				order_no,
				order_date
			})
		}

		const req = await fetch('/orders/incoming_data', params);
		const filename = req.headers.get('Content-disposition').split('=').pop();
		const blob = await req.blob();
		saveAs(blob, filename);

	}

	async function evt_handleDstDownload(evt) {

		const elem = evt.target;
		const { order_source, order_no, order_date } = elem.userData;

		const params = {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				order_source,
				order_no,
				order_date
			})
		}

		const req = await fetch('/orders/processed_data', params);
		const filename = req.headers.get('Content-disposition').split('=').pop();
		const blob = await req.blob();
		saveAs(blob, filename);

	}


	function evt_date_change (type,e) {
		//console.log("date_change");
		let i, day1, day2;
		let value = e.target.value;

		switch(type) {
		case "order_up":
			if( value == "") {
				i = 0;
				 this.DOM.order_delivery[0].checked = false;
			} else {
				//console.log("order_up="+ e.target.value);
				day1 = new Date(value);
				day2 = new Date();
				i = parseInt((day1 - day2) / 86400000);
			}
		break;
		case "delivery_up":
			if( value == "") {
				i = 0;
				 this.DOM.order_delivery[1].checked = false;
			} else {
				//console.log("delivery_up="+ e.target.value);
				day1 = new Date(value);
				day2 = new Date();
				i = parseInt((day1 - day2) / 86400000);
			}
		break;
		}

		this.MEM.date=i;
		
	}

	function evt_up_down (e) {

		let i = this.MEM.date;
		switch(e.target.value) {
		case "order_up":
		case "delivery_up":
			i--;	
			this.MEM.date=i;
		break;
		case "order_down":
		case "delivery_down":
			i++	
			this.MEM.date=i
		break;
		}
		

		const today = this.API.getDay(i);
		const toolbar = this.DOM.toolbar;

		switch(e.target.value) {
		case "order_up":
		case "order_down":
			toolbar.order_date_start.value = today;
			toolbar.order_date_end.value = today;
			toolbar.delivery_date_start.value = "";
			toolbar.delivery_date_end.value = "";
		
			this.DOM.order_delivery[0].checked = true;
		break;
		case "delivery_up":
		case "delivery_down":
			toolbar.order_date_start.value = "";
			toolbar.order_date_end.value = "";
			toolbar.delivery_date_start.value = today;
			toolbar.delivery_date_end.value = today;

			this.DOM.order_delivery[1].checked = true;
		break;
		}
	}

	function evt_order_delivery (e) {

		const today = this.API.getToday();
		const toolbar = this.DOM.toolbar;
		this.MEM.date = 0;

		switch(e.target.value) {
		case "order":
			toolbar.order_date_start.value = today;
			toolbar.order_date_end.value = today;
			toolbar.delivery_date_start.value = "";
			toolbar.delivery_date_end.value = "";
		
		break;
		case "delivery":
			toolbar.order_date_start.value = "";
			toolbar.order_date_end.value = "";
			toolbar.delivery_date_start.value = today;
			toolbar.delivery_date_end.value = today;
		break;
		}
	}

	function api_getDay(day) {
		let t = new Date();
		t.setDate( t.getDate()+day );
		return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2)
	}

	function api_getToday() {
		let t = new Date();
		return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2)
	}

	async function evt_handleIpfsDownload(evt) {

		const elem = evt.target;
		const { order_source, order_no, order_date } = elem.userData;

		const params = {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				order_source, 
				order_no, 
				order_date
			})
		}

		const req = await fetch('/ipfs/get', params);
		const filename = req.headers.get('Content-disposition').split('=').pop();
		const blob = await req.blob();
		saveAs(blob, filename);

	}

	function evt_handleSearchSubmit() {
		
		this.API.executeSearch();

	}

	async function api_executeSearch() {

		const { toolbar } = this.DOM;

		const params = {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				system : toolbar.system.value,
				order_date_start : toolbar.order_date_start.value,
				order_date_end : toolbar.order_date_end.value,
				delivery_date_start : toolbar.delivery_date_start.value,
				delivery_date_end : toolbar.delivery_date_end.value,
				amount_min : toolbar.amount_min.value,
				amount_max : toolbar.amount_max.value,
				customer : toolbar.customer.value
			})
		}

		const req = await fetch('/ipfs/search', params);
		const results = await req.json();
		this.DOM.toolbar.count.innerHTML = results.length;
		this.API.renderResults(results);

	}

	function api_renderResults(results) {

		this.DOM.results.table.innerHTML = '';
		
		const SERVICE_LOOKUP = {
			UTSUMI : '内海',
			JANBURE : 'ジャンブレ',
		}

		let confirm_amount = 0;
		let order_amount = 0;
		let j;

		const base = `${window.location.protocol}//${window.location.hostname}/ipfs`;

		results.forEach( (order) => {

			const row = this.DOM.results.table.insertRow();

			const c1 = row.insertCell();
			const c2 = row.insertCell();
			const c3 = row.insertCell();
			const c4 = row.insertCell();
			const c5 = row.insertCell();
			const c6 = row.insertCell();
			const c7 = row.insertCell();
			const c8 = row.insertCell();
			const ca = row.insertCell();
			const cb = row.insertCell();
			
			c1.setAttribute('class', 'a');
			c2.setAttribute('class', 'b');
			c3.setAttribute('class', 'c');
			c4.setAttribute('class', 'd');
			c5.setAttribute('class', 'e');
			c6.setAttribute('class', 'f');
			c7.setAttribute('class', 'g');
			c8.setAttribute('class', 'h');
			ca.setAttribute('class', 'j');
			cb.setAttribute('class', 'k');

			c1.textContent = SERVICE_LOOKUP[order.order_source];
			c2.textContent = order.order_no;
			c3.textContent = order.order_date.substr(0, 10);
			c4.textContent = order.delivery_date.substr(0, 10);
			c5.textContent = order.recipient_name;

			try {
				j = parseInt(order.amount);
				order_amount += j;
				c6.textContent = j.toLocaleString('ja-JP');
			} catch(e) {
				console.log("ParseInt Error :j="+order.amount);
				c6.textContent = '-';
			}

			//console.log(order.order_date);

			const a = document.createElement('span');
			const b = document.createElement('span');
			const c = document.createElement('button');
			
			a.userData = order;
			b.userData = order;

			a.setAttribute('class', 'link');
			b.setAttribute('class', 'link');

			a.textContent = 'Download';
			b.textContent = 'Download';

			c7.appendChild(a);
			c8.appendChild(b);

			a.addEventListener('click', this.EVT.handleSrcDownload);
			b.addEventListener('click', this.EVT.handleDstDownload);

			if(order.processed_flag === 0) {
				b.textContent = 'Not Processed';
				b.classList.add('disabled');
			} else {
				confirm_amount += j;
			}
			const table = document.createElement('table');
			table.setAttribute("class","ipfs");
			ca.appendChild(table);
			const tr = document.createElement('tr');
			table.appendChild(tr);
			
			order.ipfs_files.forEach( (file) => {
				const td = document.createElement('td');
				tr.appendChild(td);
				
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.setAttribute('href', `${base}/${file.hash}`);
				link.textContent = file.name;
				link.setAttribute('download', file.name);
				td.appendChild(link);

			});

			if(order.confirm_time != "0000-00-00 00:00:00") {
				cb.textContent = order.confirm_time;
			} else {
				cb.textContent = "";
			}
		});

		this.DOM.toolbar.confirm_total.innerText = confirm_amount.toLocaleString('ja-JP');
		this.DOM.toolbar.order_total.innerText = order_amount.toLocaleString('ja-JP');

	}

}).apply({});

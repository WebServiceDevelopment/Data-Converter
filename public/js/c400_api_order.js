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

export {
	api_processOrder,
	api_renderOrders,
	api_createTopRow,
	api_checkForFix,
	api_createShipping,
}


function api_processOrder(order) {
	//console.log("processOrder");

	const output = {};

	// 1. remove 「注文No.」 text (we don't need it)

	order.shift();

	// 2. Set the title as "【 注文書 (20/07/01) No1 】"

	output.title = order.shift();
	let title = output.title.split(" ");

	// 3. src company ?

	output.distributor = {
		name : order.shift(),
		tel : order.shift().replace(/TEL:/g, '')
	};

	// 4. dst company

	output.manufacturer = {
		id : order.shift(),
		name : order.shift(),
		fax : order.shift().replace(/FAX:/g, ''),
		tel : order.shift().replace(/TEL:/g, '')
	};

	// 5. Get Rid of labels for contents

	for(let i = 0; i < 13; i++) {
		order.shift();
	}

	// 6. Next row should be '<n>' we can get rid of it

	order.shift();

	// 7. Next we go ahead and create the shipments

	output.contents = [];
	let content;
	let do_check = true;
	let count = 0;

	for(let i = 0; i < order.length; i++) {

		let line = order[i];
		count++;
		

		//console.log("line="+line);
		if(do_check && /^\d+$/.test(line)) {

			content = {
				order_no : parseInt(line),
				has_change : false,
				recipient : {},
				shipper : {}
			};

			output.contents.push(content);
			do_check = false;
			count = 0;

		} else if(count === 1) {
			
			// 納期日

			try {
				content['delivery_date'] = line;
			} catch(err) {
				throw err;
			}

		} else if(count === 2) {
				
			// 出荷確認日
			content['shipment_confirmation_date'] = line;

		} else if(count === 3) {
			
			// 得意先No.
			content['customer_no'] = line;

		} else if(count === 4) {

			// 整理No.
			content['reference_no'] = parseInt(line);

		} else if(count === 5) {
			
			// 問合先
			content['contact'] = line.replace(/問合先：/g, '');

		} else if(count === 6) {

			// 届先名
			content.recipient.name = line;

		} else if(count === 7) {
			
			// 届先住所
			content.recipient.addr = ""

			if(line.indexOf("備考") !== 0) {
				content.recipient.addr = line;
			} else {
				i--;
			}

		} else if(count === 8 || count === 9) {

			
			if(line.indexOf("備考") === 0) {

				// 備考
				content['notes'] = line.replace(/備考：/g, '');

			} else {

				// 届先郵便番号/届先TEL/届先担当者名
				let parts = line.split("  ");
				content.recipient.post = parts[0].replace(/〒/g, '');
				try {
					content.recipient.tel = parts[1].replace(/TEL:/g, '');
				} catch(err) {
					throw err;
				}
				content.recipient.contact = parts[2];

			}

		} else if(line.indexOf("(") !== -1 && line.indexOf(")") !== -1) {

			// (商品ｺｰﾄﾞ) (商品名) (数量) (単価) (金額)

			content.products = content.products || [];
			content.products.push({
				code : line,
				name : order[i + 1],
				count : order[i + 2].trim(),
				price : order[i + 3].trim(),
				subtotal : order[i + 4].trim()
			});

			i += 4;

		} else if(line === "出荷人名：") {

			
			// 出荷人名
			
			content.shipper.name = "";
			content.shipper.addr = "";
			let prev_line = order[i - 1];

			let prev_trim = prev_line.replace(/\s/g, '');
			prev_trim = prev_trim.replace(/-/g, '');
			prev_trim = prev_trim.replace(/,/g, '');

			if(!/^\d+$/.test(prev_trim)) {
				content.shipper.name = prev_line;
			}


			do {
				
				i++;
				line = order[i];

				if(!line) {
					break;
				}

				if(line === "★送状記載事項：" || !line) {
					i--;
					break;
				} else if(line === "★変更有") {
					
					// 変更有
					content.has_change = true;

				} else if(line.indexOf("〒") !== -1) {

					// 出荷郵便番号 / TEL
					
					let parts = line.split("  ");
					content.shipper.post = parts[0].replace(/〒/g, '');
					content.shipper.tel = parts.pop().replace(/TEL:/g, '');
					break;

				} else {
					
					// 出荷住所

					content.shipper.addr = line;
				}

			} while(1);

			do_check = true;

		} else if(line === "★送状記載事項：") {
			
			// 送状 (配送) 記載事項

			let prev = order[i - 1];
			content['delivery_notice'] = "";
			if(prev.indexOf("〒") === -1) {
				content['delivery_notice'] = prev;
			}

		} else if(line === "★出荷連絡事項：") {

			// 出荷連絡事項

			let prev = order[i - 1];
			content['shipper_notice'] = "";
			if(prev.indexOf("★") === -1) {
				content['shipper_notice'] = prev;
			}

		}

		if(line && line.indexOf("★") !== -1) {
			do_check = true;
		}

	}

	return output;

}

function api_renderOrders(pdfDocument) {

	this.DOM.edi.preview.innerHTML = "";
	this.MEM.checkboxes = [];
	this.MEM.orders = [];

	let checkbox;

	pdfDocument.forEach( order => {

		if(order.title) {

			const bar = document.createElement("div");
			bar.setAttribute("class", "bar");

			const sharedData = {
				label : order.title,
				members : []
			}

			checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.checked = true;
			checkbox.userData = sharedData;
			checkbox.addEventListener('change', this.EVT.handleCheckboxChange);
			checkbox.setAttribute('disabled', 'disabled');

			this.MEM.checkboxes.push(checkbox);
			sharedData.parentCheckbox = checkbox;

			const lock_icon = document.createElement("div");
			lock_icon.setAttribute("class", "lock closed");
			lock_icon.userData = sharedData;
			lock_icon.addEventListener('click', this.EVT.handleLockClick);
			sharedData.lockIcon = lock_icon;

			const table = document.createElement("table");
			const row = table.insertRow();
			const cell_1 = row.insertCell();
			const cell_2 = row.insertCell();
			const cell_3 = row.insertCell();

			cell_1.textContent = order.title;
			cell_2.setAttribute("class", "lock-icon");
			cell_3.appendChild(checkbox);
			cell_2.appendChild(lock_icon);

			bar.appendChild(table);
			this.DOM.edi.preview.appendChild(bar);

		} else {
			
			const li = document.createElement("li");
			li.setAttribute('class', 'block');

			let a = this.API.createTopRow(order, checkbox, li);
			let b = this.API.createShipping(order);
			let c = this.API.createProducts(order);

			li.appendChild(a);
			li.appendChild(b);
			li.appendChild(c);

			this.DOM.edi.preview.appendChild(li);
			this.MEM.orders.push(order);

		}


	});

	this.MEM.checkboxes.forEach( checkbox => {

		if(!checkbox.userData.label) {
			return;
		}

		let count = 0;
		checkbox.userData.members.forEach( cb => {
			if(!cb.checked) {
				return;
			}
			count++;
		});

		if(!count) {
			checkbox.checked = false;
		}

	});


}

function api_createTopRow(order, parent, li) {

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

	label_a.textContent = "注文No.:";
	label_b.textContent = "納期日:";
	label_c.textContent = "出荷確認日:";
	label_d.textContent = "得意先No.:";
	label_e.textContent = "整理No.:";
	label_f.textContent = "問合先:";

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

	input_d.setAttribute('class', 'hover');
	input_g.setAttribute('disabled', 'disabled');
	input_d.addEventListener('click', this.EVT.handleCustomerClick);

	input_a.setAttribute("readonly", "readonly");
	input_b.setAttribute("readonly", "readonly");
	input_c.setAttribute("readonly", "readonly");
	input_d.setAttribute("readonly", "readonly");
	input_e.setAttribute("readonly", "readonly");
	input_f.setAttribute("readonly", "readonly");

	input_a.value = order.order_no;
	input_b.value = order.delivery_date;
	input_c.value = order.shipment_confirmation_date;
	input_d.value = order.customer_no;
	input_e.value = order.reference_no;
	input_f.value = order.contact;

	value_a.appendChild(input_a);
	value_b.appendChild(input_b);
	value_c.appendChild(input_c);
	value_d.appendChild(input_d);
	value_e.appendChild(input_e);
	value_f.appendChild(input_f);
	checked.appendChild(input_g);
	
	order.parent = parent;
	order.link = fixed;
	order.li = li;
	input_g.userData = order;
	
	let prior = this.API.checkForFix(order);

	//console.log("order.order_no="+order.order_no);
	if(!prior) {

		input_g.checked = true;

	} else {

		if(order.order_no === prior.update_order_no) {
			input_g.checked = true;
		}

		let ch;

		switch(order.order_no) {
		case prior.invalid_order_no:
			ch = "×";
			order.status = `修正: ${ch}`;
			break;
		case prior.remove_order_no:
			ch = "▽";
			order.status = `修正: ${ch}`;
			break;
		case prior.update_order_no:
			ch = "〇";
			order.status = `修正: ${ch}`;
			break;
		}
		
		const span = document.createElement("span");
		span.setAttribute("class", "link");
		span.textContent = "修正 " + ch;
		fixed.appendChild(span);

		span.userData = {
			order : order,
			fix : prior
		}

		span.addEventListener('click', this.EVT.handleSpanClick);
		
	}
		

	this.MEM.checkboxes.push(input_g);
	input_g.addEventListener('click', this.EVT.handleCheckboxChange);
	parent.userData.members.push(input_g);
	
	div.appendChild(table);
	return div;

}

function api_checkForFix(order) {

	for(let i = 0; i < this.MEM.fixes.length; i++) {
		
		let fix = this.MEM.fixes[i];

		for(let key in fix) {
			
			if(order.order_no !== fix[key]) {
				continue;
			}

			return fix;

		}

	}

}

function api_createShipping(order) {

	const div = document.createElement("div");
	div.setAttribute("class", "shipping");
	
	const table = document.createElement("table");

	for(let i = 0; i < 4; i++) {

		const row = table.insertRow();
		let label_d, value_d, input_d;

		const label_a = row.insertCell();
		const value_a = row.insertCell();

		if(i < 3) {
			value_a.setAttribute("colspan", "3");
		} else {

			label_d = row.insertCell();
			value_d = row.insertCell();
			input_d = document.createElement("input");

			label_d.setAttribute("class", "label d");
			value_d.setAttribute("class", "value d");
			input_d.setAttribute("type", "text");
			input_d.setAttribute("readonly", "readonly");
			value_d.appendChild(input_d);

		}

		const label_b = row.insertCell();
		const value_b = row.insertCell();
		const label_c = row.insertCell();
		const value_c = row.insertCell();

		label_a.setAttribute("class", "label a");
		label_b.setAttribute("class", "label b");
		label_c.setAttribute("class", "label c");

		value_a.setAttribute("class", "value a");
		value_b.setAttribute("class", "value b");
		value_c.setAttribute("class", "value c");

		const input_a = document.createElement("input");
		const input_b = document.createElement("input");
		const input_c = document.createElement("input");

		input_a.setAttribute("type", "text");
		input_b.setAttribute("type", "text");
		input_c.setAttribute("type", "text");

		input_a.setAttribute("readonly", "readonly");
		input_b.setAttribute("readonly", "readonly");
		input_c.setAttribute("readonly", "readonly");

		value_a.appendChild(input_a);
		value_b.appendChild(input_b);
		value_c.appendChild(input_c);

		switch(i) {
		case 0:

			label_a.textContent = "届先名";
			label_b.textContent = "出荷人名";
			label_c.textContent = "備考";

			input_a.value = order.recipient.name;
			input_b.value = order.shipper.name;
			input_c.value = order.notes;

			break;
		case 1:

			label_a.textContent = "届先郵便番号";
			label_b.textContent = "出荷郵便番号";
			label_c.textContent = "★変更";

			input_a.value = order.recipient.post;
			input_b.value = order.shipper.post;
			input_c.value = order.has_change ? "有" : "";

			break;
		case 2:

			label_a.textContent = "届先住所";
			label_b.textContent = "出荷住所";
			label_c.textContent = "★送状記載事項";

			input_a.value = order.recipient.addr;
			input_b.value = order.shipper.addr;
			input_c.value = order.delivery_notice;

			break;
		case 3:

			label_a.textContent = "届先担当";
			label_b.textContent = "出荷TEL";
			label_c.textContent = "★出荷連絡事項";
			label_d.textContent = "届先TEL";
			
			input_a.value = order.recipient.rep;
			input_b.value = order.shipper.tel;
			input_c.value = order.shipper_notice;
			input_d.value = order.recipient.tel;

			break;
		}


	}

	div.appendChild(table);
	return div;

}


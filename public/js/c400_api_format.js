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
	api_createWsdFormat,
	api_createSendFormatFix,
	api_createSendFormat
}
	
function api_createWsdFormat() {
	// console.log("createWsdFormat");


	let index = 0;
	const records = [];

	if(this.DOM.edi.yes_comments.checked) {

		records.push("");

		records.push([
			"# START",
			"INDEX",
			"PRODUCT_COUNT"
		].join(","));

		records.push([
			"# 注文No.",
			"納期日",
			"出荷確認日",
			"得意先No.",
			"整理No.",
			"問合先"
		].join(","));

		records.push([
			"# 届先名",
			"届先郵便番号",
			"届先住所",
			"届先担当者名",
			"届先TEL"
		].join(","));

		records.push([
			"# 出荷名",
			"出荷郵便番号",
			"出荷住所",
			"出荷TEL"
		].join(","));

		records.push([
			"# 備考",
			"★変更",
			"★送状記載事項",
			"★出荷連絡事項"
		].join(","));
	
		records.push([
			"# No",
			"商品ｺｰﾄﾞ",
			"商品名",
			"数量",
			"単価",
			"金額"
		].join(","));
	
		records.push([
			"# END",
			"INDEX",
			"PRODUCT_COUNT"
		].join(","));

	}

	this.MEM.checkboxes.forEach(box => {
			
		if(!box.checked) {
			return;
		}

		const order = box.userData;

		if(order.label) {
			
			if(this.DOM.edi.yes_comments.checked) {
				records.push("");
				records.push("# " + order.label);
			}

			return;
		}

		let order_count = order.products.length;
		if(this.DOM.edi.yes_skip.checked) {
			
			order_count = 0;
			for(let i = 0; i < order.products.length; i++) {

				if(order.products[i].my_company_code.length === 0) {
					continue;
				}

				order_count++;
			}

		}

		records.push("");
		records.push([
			"START", 
			index, 
			order_count
		].join(","));

		records.push([
			order.order_no,
			order.delivery_date.replace('/', '-'),
			order.shipment_confirmation_date.replace('/', '-'),
			order.customer_no,
			order.reference_no,
			order.contact
		].join(","));

		records.push([
			order.recipient.name,
			order.recipient.post,
			order.recipient.addr,
			order.recipient.contact,
			order.recipient.tel
		].join(","));

		records.push([
			order.shipper.name,
			order.shipper.post,
			order.shipper.addr,
			order.shipper.tel
		].join(","));

		records.push([
			order.notes,
			order.has_change ? 1 : 0,
			order.delivery_notice,
			order.shipper_notice
		].join(","));
		
		let detail_no = 0;
		for(let i = 0; i < order.products.length; i++) {

			if(this.DOM.edi.yes_skip.checked && order.products[i].my_company_code.length === 0) {
				continue;
			}

			records.push([
				detail_no,
				order.products[i].my_company_code,
				order.products[i].name,
				order.products[i].case_count.replace(/,/g, ''),
				order.products[i].price.replace(/,/g, ''),
				order.products[i].subtotal.replace(/,/g, '')
			].join(","));

			detail_no++;

		}

		records.push([
			"END", 
			index, 
			order_count
		].join(","));
		index++;

	});

	
	records.unshift([
		"ORDER_LENGTH", index
	].join(","))

	let text = records.join("\r\n");
	this.DOM.edi.textarea.value = text;

}

function api_createSendFormatFix() {

	const records = [];
	let date;
	
	/*
	if(this.DOM.edi.yes_comments.checked) {
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

	this.MEM.checkboxes.forEach(box => {
			
		if(!box.checked) {
			return;
		}

		const order = box.userData;
		if(order.label) {
			let index = order.label.indexOf("(");
			let d = order.label.substr(index + 1, 8).split("/");
			let year = (new Date()).getFullYear().toString();
			d.unshift(year.substr(0, 2));
			date = d.join("");
			return;
		}

		if(this.DOM.edi.yes_skip.checked) {
			for(let i = 0; i < order.products.length; i++) {
				let product = order.products[i];
				if(!product.my_company_code || product.my_company_code.length === 0) {
					return;
				}
			}
		}

		let index = 0;

		order.products.forEach( product => {
			
			const row = [];

			// A

			row.push('306');

			// B 
		
			row.push('');

			// C
		
			row.push('000000');

			// D
		
			row.push('');
		
			// E
		
			row.push('');

			// F
		
			row.push(order.recipient.name);

			// G
		
			row.push('0000');

			// H
		
			row.push('');
		
			// I
		
			row.push('');
		
			// J
		
			row.push('101');
		
			// K
		
			row.push(order.order_no);

			// L

			row.push(order.delivery_date.replace(/\//g, ''));

			// M
			
			index++;
			let str = index.toString();
			while(str.length < 3) {
				str = '0' + str;
			}
			row.push(str);

			// N
		
			let code = product.my_company_code || '00000';
			while(code.length < 5) {
				code = '0' + code;
			}
			row.push(code);

			// O
			
			row.push(product.my_company_name || product.name);

			// P
			
			row.push('');
			
			// Q
			
			let count_in_case = product.count_in_case;
			if(typeof(count_in_case)  == 'string') {
				if(count_in_case.indexOf(",")  !== -1) {
					count_in_case = count_in_case.replace(/,/g,'');
				}
			}
			row.push(count_in_case);
			
			// R
			
			let case_count = product.case_count;
			if(typeof(case_count)  == 'string') {
				if(case_count.indexOf(",")  !== -1) {
					case_count = case_count.replace(/,/g,'');
				}
			}
			row.push(case_count);

			// S
			
			let product_count = product.count;
			if(typeof(product.count)  == 'string') {
				if(product.count.indexOf(",")  !== -1) {
					product_count = product_count.replace(/,/g,'');
				}
			}
			row.push(product_count);
			
			// T
			
			let price = product.price.replace(/,/g,'');
			row.push(price);
			
			// U
			
			let subtotal = product.subtotal.replace(/,/g,'');
			row.push(subtotal);
			
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
			
			row.push(order.shipper.name);
			
			// AX
			
			row.push(order.shipment_confirmation_date.replace(/\//g, ''));
			
			// AY

			row.push(' ');
			
			// End

			records.push(row.join(","));

		});

	});

	this.DOM.edi.textarea.value = records.join("\r\n");

}

function api_createSendFormat() {

	const records = [];
	let date;
	let num = 1000;

	this.MEM.checkboxes.forEach(box => {
			
		if(!box.checked) {
			return;
		}

		const order = box.userData;

		if(order.label) {
			let index = order.label.indexOf("(");
			let d = order.label.substr(index + 1, 8).split("/");
			let year = (new Date()).getFullYear().toString();
			d.unshift(year.substr(0, 2));
			date = d.join("");
			return;
		}

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

		row.push(date);

		// Position 06 Unknown

		row.push("");

		// Position 07 Unknown

		row.push("");

		// Position 08  << 整理番号? >>

		row.push(order.reference_no);

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

		row.push(order.customer_no);

		// Position 16 Unknown

		row.push("");

		// Position 17 << 注文数 / 届け先 ? >>
		
		let product_count = order.products.length.toString();
		let product_list = order.products;

		if(this.DOM.edi.yes_skip.checked) {

			product_count =  0;
			product_list = [];

			for(let i = 0; i < order.products.length; i++) {
				if(order.products[i].my_company_code.length === 0) {
					continue;
				}
				product_count++;
				product_list.push(order.products[i]);
			}
			product_count = product_count.toString();
		}

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

		row.push(getFormatPhone(order.shipper.tel));

		// Position 31

		row.push(" ");

		// Position 32  << 出荷名 >>

		let shipper_name = order.shipper.name;
		while(shipper_name.length < 35) {
			shipper_name += " ";
		}

		// Position 33 << 「発注番号」>>
		
		row.push("発注番号");

		// Position 34 - 43
		
		for(let k = 0; k < 5; k++) {
			if(!product_list[k]) {
				row.push(" ");
				row.push(" ");
				continue;
			}

			row.push(product_list[k].name);
			row.push(product_list[k].case_count);
		}

		// Positions 44 - 53

		for(let k = 0; k < 10; k++) {
			row.push("");
		}

		// Position 54

		row.push("A");
		records.push(row.join(","));

	});

	this.DOM.edi.textarea.value = records.join("\r\n");
}

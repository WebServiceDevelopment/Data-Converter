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
	api_processPdf,
	api_storePdf,
	api_readPdfFile
}

function api_processPdf(lines) {
	//console.log("processPdf");

	const orders = [];
	let content, meta;
	let page = -1;
	let count = -1;
	let do_scan = true;
	const digit_check = /^\d+$/;
	const date_check = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;

	do {

		let line = lines.shift();
		count++;

		/**
		 * SKIP  「注文No.」
		 **/

		if(line.indexOf("注文No.")===0) {
			continue;
		}

		/**
		 * SKIP 「<1> 」
		 **/
		
		/**
		 * START OF PAGE
		 **/
// headr
		if(line.indexOf("【 注文書") === 0) {

			orders.push({
				title: line
			});

			let parts = line.split(" ");
			let d = parts[2].substr(1, 8).split("/");
			let year = (new Date()).getFullYear().toString();
			d[0] = year.substr(0, 2) + d[0];

			meta = {
				no : parts[3],
				date : d.join("-")
			}
			//console.log("parts[3]=",parts[3]);
			page++;

			while(lines[0] !== "(金額)") {
				lines.shift();
			}
			lines.shift();

			continue;

		}

		//console.log("line="+line);
		if(line == "" || line == null || line == " "){

			continue;
		}


		// Content

// 注文No.:
		let order_no;
		if(do_scan && !digit_check.test(line)) {
		} else {
			//console.log("WHAT IS THIS? %s", line);
			if(!date_check.test(lines[1]) ) {
				line = lines.shift();
			}

			order_no = line;
		}

		do_scan = false;

// 納期日:
		if(lines[0] == " ") {
			lines.shift();
		}
		let delivery_date = lines.shift();

// 出荷確認日:
		if(lines[0] == " ") {
			lines.shift();
		}
		let shipment_confirmation_date = lines.shift();

// 得意先No.
		if(lines[0] == " ") {
			lines.shift();
		}
		let customer_no = lines.shift();

// 整理No.
		if(lines[0] == " ") {
			lines.shift();
		}
		let reference_no = lines.shift();

// 問合先：
		if(lines[0] == " ") {
			lines.shift();
		}
		let contact = lines.shift();
		if( contact.indexOf("問合先：") !== -1) {
			contact = contact.split("：")[1];
		}

		if(lines[0] == " ") {
			lines.shift();
		}
		contact += '　'+lines.shift();

		content = {
			no : meta.no,
			order_date : meta.date,
			order_no :  parseInt(order_no),
			delivery_date : delivery_date,
			shipment_confirmation_date : shipment_confirmation_date,
			customer_no : customer_no,
			reference_no : reference_no,
			contact : contact,
			has_change : 0,
			recipient : {
				name : '',
				addr : '',
				post: '',
				tel : '',
				rep : ''
			},
			shipper : {
				name : '',
				addr : '',
			post : '',
				tel : ''
			},
			notes : '',
			delivery_notice : '',
			shipper_notice : '',
			products : []
		}
		//console.log("order_date="+content.order_date+":order_no="+content.order_no+":delivery_date="+content.delivery_date+":shipment_confirmation_date="+content.shipment_confirmation_date+":customer_no="+content.customer_no+":reference_no="+content.reference_no+":"+content.contact);

		orders.push(content);

/*
* recipient
* 届先
*/
		if(lines[0] == " " || lines [0] == "") {
			lines.shift();
		}

		let max =8;
		for(let i = 0; i < max; i++) {
			//console.log("recipient="+lines[0]+":"+lines[1]+":"+lines[2]+":"+ lines[3]+":"+lines[4]+":"+lines[5]+":"+lines[6]);
			line = lines.shift();
			if(line == " ") {
				continue;
			}

			if(line.indexOf('備考') === 0) {
				content.notes = line.replace('備考：', '');
				//console.log("備考"+content.notes);
				break;
			} else if(line.indexOf('〒') === 0) {
				
				content.recipient.post = line.replace(/〒/g, '');
				content.recipient.tel = lines[1].replace(/TEL:/g, '');
				if(content.recipient.tel === ' -') {
					content.recipient.tel = '';
				}
				if(lines[3].charAt(0) == "(") {
				} else {
					content.recipient.rep = lines[3];
				}

				lines.shift();
				lines.shift();
				//console.log("Product:"+lines[0]+":"+lines[1]+":"+lines[2]+":"+ lines[3]+":"+lines[4]+":"+lines[5]+":"+ lines[6]+":"+lines[7]);
				continue;


			} else if(content.recipient.name.length === 0) {
				content.recipient.name = line;

				if(lines[0] == " " || lines[0] == "") {
					lines.shift();
					max++;
					max++;
				}
			} else {
				if(i==1) {
					content.recipient.addr = line;
				}
			}

		}

/*
* Products
*/
		while(lines[0].charAt(0) !== '(' && lines[0].charAt(lines[0].length - 1) !== ')') {

			line = lines.shift();

		}
		//console.log("Product:"+lines[0]+":"+lines[1]+":"+lines[2]+":"+ lines[3]+":"+lines[4]+":"+lines[5]+":"+ lines[6]+":"+lines[7]);

		let wk = lines[0].split(" ");

		while(lines[0].charAt(0) === '(' && wk[0].charAt(wk[0].length - 1) === ')') {

			let code = wk[0].substr(1,wk[0].length-2);
			let name = wk[1];
			let count = lines[2];

			//console.log("Product:"+lines[0]+":"+lines[1]+":"+lines[2]+":"+ lines[3]+":"+lines[4]+":"+lines[5]+":"+ lines[6]+":"+lines[7]);
			let price;
			let subtotal;
			price = lines[4];
			//subtotal = parseInt(lines[6].replace(",",""));
			//console.log(" subtotal="+lines[6]);
			subtotal = lines[6];

			content.products.push({
				code : code,
				name : name,
				count : count,
				price : price,
				subtotal : subtotal
			});

			
			lines.shift();
			lines.shift();
			lines.shift();
			lines.shift();
			lines.shift();
			lines.shift();
			lines.shift();

			wk = lines[0].split(" ");
		}		
		//console.log("products 3");
/*
* Shipper
* 出荷
*/
		line = lines.shift();
		if(line == "出荷人名：" ) {
			line = lines.shift();
			if( line.indexOf("変更有") !== -1) {
				content.has_change = 1;
			} else {
				content.shipper.name = line;
			}
		}

		let remaining = [];
		do {
			
			line = lines.shift();

			if(line == " " || line =="") {
				continue;
			}
			remaining.push(line);

			if(line === "★出荷連絡事項：") {
				break;
			}


		} while(lines.length);
		

		remaining.reverse();

		//console.log("remaining:"+remaining[0]+":"+remaining[1]+":"+remaining[2]+":"+ remaining[3]+":"+remaining[4]+":"+remaining[5]+":"+ remaining[6]+":"+remaining[7]+":"+remaining[8]+":"+remaining[9]);
		let i = 0;


		
		let len = remaining.length;
		while(remaining.length) {

			line = remaining.shift();

			switch(line) {
			case "★出荷連絡事項：":
				line = remaining.shift();
				if( line.indexOf("送状記載事項") === -1) {
					content.delivery_notice = line;
				}
				continue;

				break;
			case "★送状記載事項：":
				if(line.indexOf("TEL") !== -1) {
					content.shipper_notice = remaining.shift();;
				}

				continue;

				break;
			case "★変更有":

				content.has_change = 1;

			//console.log(":"+remaining[0]+":"+remaining[1]+":"+remaining[2]+":"+ remaining[3]+":"+remaining[4]+":"+remaining[5]+":"+ remaining[6]+":"+remaining[7]);

				
				//console.log("orders.length="+orders.length);

				break;
			default:

				if(line.indexOf("TEL") !== -1) {
					let parts = line.split(":");
					content.shipper.tel = parts[1];
					//console.log("TEL="+line);
				} else if(line.indexOf("〒") !== -1) {
					
					let parts = line.split("  ");
					content.shipper.post = parts[0].replace(/〒/g, '');
					line = remaining.shift();
					if( line != undefined) {
						content.shipper.addr = line;
					}
	
				} else {
					//console.log("i="+i+":line="+line+":len-"+len);
	
				}
			}

		i++;
		}

		do_scan = true;
		let txt = JSON.stringify(content);
		content.hash = SparkMD5.hash(txt);

	} while(lines.length);

	return orders;

}

async function api_storePdf(orders) {

	let data;

	const params = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body : JSON.stringify({
			orders
		})
	}

	try {
		data = await fetch('/utsumi/storePDF', params);
		data = await data.json();
	} catch(err) {
		alert('Utsumi Error 411\nWSDに連略してください');
		throw err;
	}

	for(let i = 0; i < orders.length; i++) {
		let order = orders[i];
		if(order.title) {
			continue;
		}
		order.order_uuid = data.shift();
	}

}

async function api_readPdfFile(files) {

	for(let i = 0; i < files.length; i++) {

		let data;
		let file = files[i];
		let loadingTask;

		let parts = file.name.split(".");
		let ext = parts.pop().toLowerCase();
		
		// Debug
		if(ext === "json") {
			data = await this.API.readFileText(file);
			let processed = JSON.parse(data);
			this.API.handleProcessed(processed);
			this.DOM.edi.filename.value = "utsumi_debug.csv";
			continue;
		}

		if(ext !== "pdf") {
			continue;
		}

		try {
		data = await this.API.readFileBinary(file);
		} catch(err) {
			throw err;
		}
		
		this.MEM.file = {
			name : file.name,
			hash : SparkMD5.ArrayBuffer.hash(data)
		}
		parts.push("csv");
		this.DOM.edi.filename.value = parts.join(".");

		const PDFJS = window.pdfjsLib;
		PDFJS.GlobalWorkerOptions.workerSrc = '../lib/pdf.worker.js';
		loadingTask = PDFJS.getDocument({"data":data});

		loadingTask.promise.then( (pdf) => {
			// jump a
			this.API.analysisPdfText(pdf, file);
			this.DOM.edi.fixed.removeAttribute('disabled');
		});
	}

}

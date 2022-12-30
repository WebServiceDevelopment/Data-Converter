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
	pdf_utsumi,
	pdf_wsd,
}

function pdf_wsd(Page) {

	const orders = [];
	let content, meta;
	let page = -1;
	let count = -1;
	let do_scan = true;
	const digit_check = /^\d+$/;
	const date_check = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;

	const TO = [
			'林製紙株式会社',
			'御中'
		];
	const FROM = [
			'株式会社 ウェブサービス・ディベロップメント',
			'〒416-0942',
			'静岡県富士市上横割１８４－３階BC',
			'TEL 050-3569-8312',
			'担当 小川 恒生',
			'070-6468-5547',
			'kogawa@wsd.co.jp',
			'下記の通り請求申し上げます。'
		];

	const TH = [ '品目', '数量', '税率','単価', '金額' ];

	const FT = [ '振込先', '富士', '口座', 'カ）', '※恐れ', '蒲田', '普通', '駅南'];

	const OH = [ '税込み', '本請求', '（ＥＤＩtoＣＳＶ ）' ];

	let lines = [];
	let result2 = [];
	let i,j, line;
	let obj,wk;
		
	for(i = 0; i < Page.length; i++) {

		line = Page[i];

		if(line.indexOf('請求金額') === 0) {
			lines.push(line);
			for( i++, line = Page[i]; line == " " ;i++) {
				line = Page[i];
			}
			
			if( lines.indexOf("\\") === 0 ) {
				lines.push(line);
			}
			continue;
			
		}

		if(line.indexOf('請求額') === 0) {
			//lines.push(line);
			for( i++, line = Page[i]; line == " " ;i++) {
				line = Page[i];
			}
			
			//lines.push(line);

			obj = {"請求額":line};
			result2.push(obj);
			continue;
			
		}

		if(line.indexOf('消費税') === 0) {
			//lines.push(line);

			i++;
			line = Page[i];
			if( line == " ") {
				//console.log("1 消費税:"+line);
				i++;
				line = Page[i];
			}

			//lines.push(line);

			obj = {"消費税 10%":line};
			result2.push(obj);
			continue;
		}

		if(line.indexOf('小 計') === 0) {
			//lines.push(line);
			for( i++, line = Page[i]; line == " " ;i++) {
				line = Page[i];
			}
			//lines.push(line);
			
			obj = {"小計":line};
			result2.push(obj);
			continue;
			
		}


		if(line === '請') {
			continue;
		} else if(line === '求') {
			continue;
		} else if(line === '書') {
			continue;
		}

		for( j=0;j<OH.length;j++) { 
			if(line.indexOf(OH[j]) === 0) {
				i++;
				line = Page[i];
				continue;
			}
		}

		for( j=0;j<TO.length;j++) { 
			if(line.indexOf(TO[j]) === 0) {
				if(i == 0) {
					lines.push(line);
				}
				i++;
				line = Page[i];
				continue;
			}
		}

		for( j=0;j<FROM.length;j++) { 
			if(line.indexOf(FROM[j]) === 0) {
				if( j == 0) {
					lines.push(line);
				}
				i++;
				line = Page[i];
				continue;
			}
		}

		for( j=0;j<TH.length;j++) { 
			if(line.indexOf(TH[j]) === 0) {
				i++;
				line = Page[i];
				continue;
			}
		}


// footer

		for( j=0;j<FT.length;j++) { 
			if( line == "" || line == null) {
				break;
			}
			if(line.indexOf(FT[j]) === 0) {
				i++;
				line = Page[i];
				continue;
			}
		}

		if( line === " ") {
			continue;
		} else if( line === "") {
			continue;
		} else if( line === undefined) {
			continue;
		}

		//console.log(line);
		lines.push(line);
	}

	//console.log("lines="+lines);

	let result = [];


	for (i=0; i<lines.length; i++) {
		let line = lines[0];
		//console.log(line);
		count++;

		//console.log(line);
		if(line.indexOf(FROM[0])===0) {
			lines.shift();
			obj = {"請求元":FROM[0]};
			result.push(obj);
		} else if(line.indexOf("発行日")===0) {
			line = lines.shift();
			obj = {"発行日":line.split("発行日：")[1]};
			result.push(obj);
		} else if(line.indexOf("請求金額")===0) {
			lines.shift();
			line = lines.shift();
			obj = {"請求金額":line.substr(1)};
			result.push(obj);
		}
	}

	
	do {
		let item, item2, tax,unit, quantity, amount;
		let obj;

		item = lines.shift();
		item2 = lines.shift();
		tax = lines.shift();
		unit = lines.shift();
		quantity = lines.shift();
		amount = lines.shift();
		obj = {"摘要":item+" "+item2+":"+tax+":"+unit+":"+quantity+":"+amount};
		result.push(obj);
		
	} while(lines.length);

	result = result.concat(result2);

	let key;
	for( i=0;i<result.length; i++) {
		key = Object.keys(result[i]);
		console.log(key+":"+result[i][key]);
	}

	let txt = JSON.stringify(content);
	content.hash = SparkMD5.hash(txt);


	return orders;

}

function pdf_utsumi(Page) {

	const orders = [];
	let content, meta;
	let page = -1;
	let count = -1;
	let do_scan = true;
	const digit_check = /^\d+$/;
	const date_check = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;

	let lines = [];
	let i,j;
		
// footer
	for(i = 0; i < Page.length; i++) {

		let line = Page[i];

		/**
		 * SKIP 「<1> 」
		 **/

		if(line.charAt(0) === '<' && line.charAt(line.length - 1) === '>') {
			continue;
		} else if(line.charAt(0) === '-' && line.charAt(line.length - 1) === '-') { 
			continue;
		} else if(line.indexOf('印刷日時') === 0) {
			continue;
		} else if( line === "") {
			continue;
		}

		lines.push(line);
	}

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
			// 20221115 add
			continue;

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
		let customer_no = lines.shift() ;

// 整理No.
		if(lines[0] == " ") {
			lines.shift();
		}
		let reference_no = lines.shift() ;

// 問合先：
		if(lines[0] == " ") {
			lines.shift();
		}
		let contact = lines.shift() ;
		if( contact != null) {
			if( contact.indexOf("問合先：") !== -1) {
				contact = contact.split("：")[1];
			}

			if(lines[0] == " ") {
				lines.shift();
			}
			contact += '　'+lines.shift();
		}

		if(lines[0] == null) {
			count--;
			break;
		}

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
				if( line.indexOf(" ") !== -1) {
					line = line.replace(" ","　");
				}
				//console.log("備考"+content.notes);
				break;
			} else if(line.indexOf('〒') === 0) {
				// 届先郵便番号
				
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
				// 届先名
				if( line.indexOf(" ") !== -1) {
					line = line.replace(" ","　");
				}
				content.recipient.name = line;

				if(lines[0] == " " || lines[0] == "") {
					lines.shift();
					if(lines[0] == "御中") {
						 content.recipient.name +="　御中";
						 lines.shift();
					}
					max++;
					max++;
				}
			} else {
				if(i==1) {
					// 届先住所
					if( line.indexOf(" ") !== -1) {
						line = line.replace(" ","　");
					}
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
				if( line.indexOf(" ") !== -1) {
					line = line.replace(" ","　");
				}
				content.shipper.name = line;
			}
		}

		let remaining = [];
		for (line = lines.shift(); lines.length>0 ; line = lines.shift()) {

			if(line == " " || line =="") {
				continue;
			}
			remaining.push(line);

			if(line === "★出荷連絡事項：") {
				break;
			}

		}

		// Added Oct, 25, 2022 - Ben , Ogawa
		// << Start
		
		let remaining_flag = 0;
		for(let i = 0; i < remaining.length; i++) {

			let wk = remaining[i].split(" ");
                        if (!( wk[0].charAt(0) === "(" && wk[0].charAt(wk[0].length - 1) === ")" )) {
                                continue;
                        }
                        remaining_flag++;

                        const myProduct = {
                                code: wk[0].substr(1, wk[0].length - 2),
                                name: wk[1],
                                count: remaining[i + 1],
                                price: remaining[i + 2],
                                subtotal: remaining[i + 3],
                        };

                        content.products.push(myProduct);

                        i++;
                        i++;
                        i++;
		}

		if(remaining_flag > 0) {

                        if (remaining[remaining_flag*4 ] == "出荷人名：") {
                                line = remaining[remaining_flag*4+1];
                                if (line.indexOf(" ") !== -1) {
                                        line = line.replace(" ", "　");
                                }
                                content.shipper.name = line;
                        }
                }

		// End >>

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
					// 出荷郵便番号
					
					let parts = line.split("  ");
					content.shipper.post = parts[0].replace(/〒/g, '');

					// 出荷住所
					line = remaining.shift();
					if( line != undefined) {
						if( line.indexOf(" ") !== -1) {
							line = line.replace(" ","　");
						}
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

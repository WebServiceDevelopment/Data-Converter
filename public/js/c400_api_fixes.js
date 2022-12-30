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
	api_displayFixes, 
	api_selectFixes,
	api_registerFixes
}


async function api_displayFixes() {

	console.log("api_displayFixes");

	let searchTerm = this.DOM.history.input.value;
	searchTerm = searchTerm.replace("Fix:", "");
	searchTerm = searchTerm.trim();

	const params1 = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body : JSON.stringify({
			order_no: searchTerm
		})
	}
	
	let fix;
	try {
		const req = await fetch('/utsumi/lookupFixes2', params1);
		fix = await req.json();
	} catch(err) {
		alert('Utsumi Error 401\nWSDに連略してください');
		throw err;
	}

	if(!fix || fix == null) {
		return;
	}

	const customer_no = fix.customer_no;
	let find = [
		{
			date : 	fix.invalid_date,
			order_no : fix.invalid_order_no,
			reference_no : fix.invalid_reference_no
		},
		{
			date : 	fix.remove_date,
			order_no : fix.remove_order_no,
			reference_no : fix.remove_reference_no
		},
		{
			date : 	fix.update_date,
			order_no : fix.update_order_no,
			reference_no : fix.update_reference_no
		}
	];

	this.MEM.checkboxes.forEach( cb => {
		
		let userData = cb.userData;

		// We only want to grab top member elements
		 
		if(!userData.members) {
			return;
		}

		let found = 0;
		let members = userData.members;

		for(let i = 0; i < members.length; i++) {

			if(find.length === 0) {
				members[i].userData.li.style.display = "none";
				continue;
			}
			
			for(let k = 0; k < find.length; k++) {
				
				let a = members[i].userData;
				if(a.customer_no != customer_no) {
					members[i].userData.li.style.display = "none";
					continue;
				}

				if(a.order_no != find[k].order_no) {
					members[i].userData.li.style.display = "none";
					continue;
				}

				if(a.reference_no != find[k].reference_no) {
					members[i].userData.li.style.display = "none";
					continue;
				}

				members[i].userData.li.removeAttribute("style");
				found++;
				find.splice(k, 1);
				break;

			}

		}

		if(found === 0) {
			let elem = cb;
			while(elem.parentNode && elem.tagName !== "DIV") {
				elem = elem.parentNode;
			}
			elem.style.display = "none";
		}


	});

	this.DOM.history.reset.classList.remove("hide");
	this.DOM.history.list.innerHTML = "";

	if(find.length === 0) {
		return;
	}
	
	const params2 = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body : JSON.stringify({
			customer_no: customer_no,
			find: find
		})
	}
	let data;

	try {
		const req = await fetch('/utsumi/getFixOrders2', params2);
		data = await req.json();
	} catch(err) {
		alert('Utsumi Error 402\nWSDに連略してください');
		throw err;
	}

	if (data.length ==0) {
		return;
	}

	data.forEach(point => {

		point.recipient = JSON.parse(point.recipient);
		point.shipper = JSON.parse(point.shipper);
		point.products = JSON.parse(point.products);

		let li = this.API.renderHistoryItem(point, [fix]);
		this.DOM.history.list.appendChild(li);

	});

}

function api_selectFixes(processed) {

	return new Promise( async (resolve, reject) => {
		
		let order_no = [];
		let start_date;

		for(let i = 0; i < processed.length; i++) {
			
			let order = processed[i];

			if(!order || !order.recipient) {
				continue;
			}
			
			start_date = order.order_date;

			order_no.push({
				order_no : order.order_no,
				customer_no : order.customer_no
			});
		}
		

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				list: order_no
			})
		}

		let data;
		try {
			const req = await fetch('/utsumi/selectFixes2', params);
			data = await req.json();
		} catch(err) {
		alert('Utsumi Error 404\nWSDに連略してください');
			throw err;
		}

		//console.log(data);

		for(let i = 0; i < data.length; i++) {
			data[i].invalid_date = new Date(data[i].invalid_date);
			data[i].remove_date = new Date(data[i].remove_date);
			data[i].update_date = new Date(data[i].update_date);
		}


// add <<
/*
* １ヶ月以内のデータのみ処理対象
*/
		let _data = [];
		let dt = new Date(start_date);
		dt.setMonth(dt.getMonth()-1);

		let yyyymmdd = dt.getFullYear()+"-"+('0'+(dt.getMonth()+1)).slice(-2)+"-"+('0'+(dt.getDate())).slice(-2);

		let d1,d2,d3;
		let k = 0;
		for(let i in data) {
			if(data[i] == null) {
				continue;
			}
			if(data[i].invalid_date == null || data[i].invalid_date == 'undefined') {
				continue;
			}

			//console.log("data[i].invalid_date="+data[i].invalid_date);
			d1 = data[i].invalid_date.getFullYear();
			d2 = data[i].invalid_date.getMonth()+1;
			d3 = data[i].invalid_date.getDate();
			let _yyyymmdd = d1 +"-"+ d2 +"-"+ d3;

			if(yyyymmdd >= _yyyymmdd) {
				continue;
			}
			//console.log(_yyyymmdd);

			_data.push(data[i]);
		}

		resolve(_data);
// >>

	});

}

function api_registerFixes(processed){
		
	return new Promise( async (resolve, reject) => {
	
		for(let n = 0; n < processed.length; n++) {

			let order = processed[n];



			let prev_order = parts[1].substr(0, 5);
			let latin = "";

			for(let i = 0; i < prev_order.length; i++) {
		
				switch(prev_order.charAt(i)) {
				case "０":
					latin += "0";
					break;
				case "１":
					latin += "1";
					break;
				case "２":
					latin += "2";
					break;
				case "３":
					latin += "3";
					break;
				case "４":
					latin += "4";
					break;
				case "５":
					latin += "5";
					break;
				case "６":
					latin += "6";
					break;
				case "７":
					latin += "7";
					break;
				case "８":
					latin += "8";
					break;
				case "９":
					latin += "9";
					break;
				}

			}

		let invalid_order_no = parseInt(latin);
		let removed_order_no = order.order_no;
		let updated_order_no;

		for(let i = n + 1; i < processed.length; i++) {
			
			let next = processed[i];
			if(!next || !next.recipient) {
				continue;
			}

			if(order.customer_no !== next.customer_no) {
				continue;
			}

			if(order.products.length !== next.products.length) {
				continue;
			}
			
			let match = true;

			for(let k = 0; k < order.products.length; k++) {
				
				let a = order.products[k];
				a.count = parseInt(a.count);
				a.price = parseInt(a.price);
				a.subtotal = parseInt(a.subtotal);

				let b = next.products[k];
				b.count = parseInt(b.count);
				b.price = parseInt(b.price);
				b.subtotal = parseInt(b.subtotal);

				if(a.code !== b.code) {
					match = false;
					break;
				}

				if(a.count !== b.count * -1) {
					match = false;
					break;
				}

				if(a.price !== b.price) {
					match = false;
					break;
				}

				if(a.subtotal !== b.subtotal * -1) {
					match = false;
					break;
				}

			}

			if(!match) {
				continue;
			}
			
			updated_order_no = next.order_no;
			break;

		}

		if(!updated_order_no) {
			continue;
		}

		let a = invalid_order_no;
		let b = removed_order_no;
		let c = updated_order_no;

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				a: a,
				b: b,
				c: c
			})
		}
		
		let data;
		try {
			const req = await fetch('/utsumi/registerFix', params);
			data = await req.json();

		} catch(err) {
			alert('Utsumi Error 410\nWSDに連略してください');
			throw err;
		}


		}

		resolve();

	});


}

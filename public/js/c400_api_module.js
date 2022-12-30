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
	api_implementSearch,
	api_resetCheckList,
}

async function api_implementSearch() {

	console.log("api_implementSearch called");

	this.API.resetCheckList();

	if(this.DOM.history.input.value.indexOf("Fix:") === 0) {
		this.API.displayFixes();
		return;
	}

	// Step 1 : Exclude

	const exclude = [];
	let array = this.MEM.checkboxes || [];

	array.forEach( cb => {
		if(cb.userData.label) {
			return;
		}

		exclude.push(cb.userData.order_uuid);
	});

	this.DOM.history.list.innerHTML = "";

	// Start 1.5 Prepare Arguments

	let search_term = this.DOM.history.select.value;
	let search_key = this.DOM.history.input.value;

	// Step 2 : Show In-Browser Results


	array.forEach( cb => {

		let userData = cb.userData;

		// We only want to grab top member elements
		 
		if(!userData.members) {
			return;
		}

		let found = 0;
		let members = userData.members;

		for(let i = 0; i < members.length; i++) {
		if(members[i].userData[search_term] != search_key) {
				members[i].userData.li.style.display = "none";
				continue;
			}

			members[i].userData.li.removeAttribute("style");
			found++;
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

	// Step 3 Fetch Results from Database
	
	let data;
	let req;
	
	const params1 = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body : JSON.stringify({
			query: search_key,
			key: search_term,
			exclude: exclude
		})
	}
	try {
		req = await fetch('/utsumi/executeSearch', params1);
		data = await req.json();
	} catch(err) {
		alert('Utsumi Error 403\nWSDに連略してください');
		throw err;
	}
	
	if(!data.length || data.length == 0) {
		return;
	}

	let order_list = [];
	data.forEach(order => {
		order_list.push(order.order_no);
	});

	const params = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body : JSON.stringify({
			list: order_list
		})
	}

	let fix;
	try {
		req = await fetch('/utsumi/selectFixes2', params);
		fix = await req.json();
	} catch(err) {
		alert('Utsumi Error 404\nWSDに連略してください');
		throw err;
	}

	this.DOM.history.list.innerHTML = "";
	data.forEach(point => {

		point.recipient = JSON.parse(point.recipient);
		point.shipper = JSON.parse(point.shipper);
		point.products = JSON.parse(point.products);

		let li = this.API.renderHistoryItem(point, fix);
		this.DOM.history.list.appendChild(li);

	});

}


function api_resetCheckList() {

	// 20220313 add k.ogawa
	if( this.MEM.checkboxes == undefined) {
		return;
	}

	this.MEM.checkboxes.forEach( cb => {
		
		let userData = cb.userData;

		// We only want to grab top member elements
		 
		if(userData.members) {
			
			let elem = cb;
			while(elem.parentNode && elem.tagName !== "DIV") {
				elem = elem.parentNode;
			}
			elem.removeAttribute("style");

		} else {

			userData.li.removeAttribute("style");

		}

	});

}


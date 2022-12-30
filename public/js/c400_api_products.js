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
	api_createProducts,
	api_matchProductCode
}


function api_createProducts(order, userData) {

	const div = document.createElement("div");
	div.setAttribute("class", "products");

	const table = document.createElement("table");

	// Thead

	const thead = document.createElement("thead");
	let row = thead.insertRow();

	const th_a1 = document.createElement("th");
	const th_a2 = document.createElement("th");
	const th_b1 = document.createElement("th");
	const th_b2 = document.createElement("th");
	const th_c = document.createElement("th");
	const th_d1 = document.createElement("th");
	const th_d2 = document.createElement("th");
	const th_e = document.createElement("th");
	const th_f = document.createElement("th");

	th_a1.textContent = "自社コード";
	th_a2.textContent = "内海コード";
	th_b1.textContent = "商品名(内海)";
	th_b2.textContent = "商品名(自社)";
	th_c.textContent = "数量";
	th_d1.textContent = "単価 (Master)";
	th_d2.textContent = "単価 (EDI)";
	th_e.textContent = "金額";
	th_f.textContent = "個口数";

	th_a1.setAttribute("class", "a");
	th_a2.setAttribute("class", "a");
	th_b1.setAttribute("class", "b");
	th_b2.setAttribute("class", "b");
	th_c.setAttribute("class", "c");
	th_d1.setAttribute("class", "d");
	th_d2.setAttribute("class", "d");
	th_e.setAttribute("class", "e");
	th_f.setAttribute("class", "f");

	row.appendChild(th_a1);
	row.appendChild(th_a2);
	row.appendChild(th_b1);
	row.appendChild(th_b2);
	row.appendChild(th_c);
	row.appendChild(th_d1);
	row.appendChild(th_d2);
	row.appendChild(th_e);
	row.appendChild(th_f);

	// Tbody

	const tbody = document.createElement("thead");

	for(let i = 0; i < order.products.length; i++) {
		
		row = thead.insertRow();

		let td_a1 = row.insertCell();
		let td_a2 = row.insertCell();
		let td_b1 = row.insertCell();
		let td_b2 = row.insertCell();
		let td_c = row.insertCell();
		let td_d1 = row.insertCell();
		let td_d2 = row.insertCell();
		let td_e = row.insertCell();
		let td_f = row.insertCell();

		td_a1.setAttribute('class', 'a');
		td_a2.setAttribute('class', 'a');
		td_b1.setAttribute('class', 'b');
		td_b2.setAttribute('class', 'b');
		td_c.setAttribute('class', 'c');
		td_d1.setAttribute('class', 'd');
		td_d2.setAttribute('class', 'd');
		td_e.setAttribute('class', 'e');
		td_f.setAttribute('class', 'f');

		let input_a1 = document.createElement("input");
		let input_a2 = document.createElement("input");
		let input_b1 = document.createElement("input");
		let input_b2 = document.createElement("input");
		let input_c = document.createElement("input");
		let input_d1 = document.createElement("input");
		let input_d2 = document.createElement("input");
		let input_e = document.createElement("input");
		let input_f = document.createElement("input");

		const label1 = document.createElement("label");
		const label2 = document.createElement("label");

		const radio1 = document.createElement("input");
		const radio2 = document.createElement("input");

		radio1.setAttribute("type", "radio");
		radio2.setAttribute("type", "radio");
		
		let radio_name = Math.random().toString(36).substring(7);
		radio1.setAttribute("name", radio_name);
		radio2.setAttribute("name", radio_name);

		label1.appendChild(radio1);
		label1.appendChild(input_d1);

		label2.appendChild(radio2);
		label2.appendChild(input_d2);

		input_a1.setAttribute('type', 'text');
		input_a2.setAttribute('type', 'text');
		input_b1.setAttribute('type', 'text');
		input_b2.setAttribute('type', 'text');
		input_c.setAttribute('type', 'text');
		input_d1.setAttribute('type', 'text');
		input_d2.setAttribute('type', 'text');
		input_e.setAttribute('type', 'text');
		input_f.setAttribute('type', 'text');

		input_a1.setAttribute('class', 'code');
		input_a2.setAttribute('readonly', 'readonly');
		input_b1.setAttribute('readonly', 'readonly');
		input_b2.setAttribute('readonly', 'readonly');
		input_c.setAttribute('readonly', 'readonly');
		input_d1.setAttribute('readonly', 'readonly');
		input_d2.setAttribute('readonly', 'readonly');
		input_e.setAttribute('readonly', 'readonly');
		input_f.setAttribute('readonly', 'readonly');

		input_d1.addEventListener('click', this.EVT.updateRadio);
		input_d2.addEventListener('click', this.EVT.updateRadio);

		td_f.appendChild(input_f);
		input_f.setAttribute("placeholder", "個口数");

		const userData = {
			data : order.products[i],
			radio : [ radio1, radio2 ],
			input : input_e,
			code : input_a1,
			price_display : input_d1,
			name_display : input_b2,
			count_display : input_f
		}

		radio1.userData = userData;
		radio2.userData = userData;
		input_a1.userData = userData;

		input_a1.addEventListener('keydown', this.EVT.handleInputPriceKey);
		radio1.addEventListener('change', this.EVT.handleRadioPriceChange);
		radio2.addEventListener('change', this.EVT.handleRadioPriceChange);

		const rel = document.createElement("div");
		rel.setAttribute("class", "rel");
		rel.appendChild(input_a1);
		userData.rel = rel;

		td_a1.appendChild(rel);
		td_a2.appendChild(input_a2);
		td_b1.appendChild(input_b1);
		td_b2.appendChild(input_b2);
		td_c.appendChild(input_c);
		td_d1.appendChild(label1);
		td_d2.appendChild(label2);
		td_e.appendChild(input_e);
		
		input_a1.setAttribute("placeholder", "自社コード");
		input_a2.value = order.products[i].code;
		input_b1.value = order.products[i].name;
		input_c.value = order.products[i].count;
		input_d2.value = order.products[i].price;
		input_e.value = order.products[i].subtotal;

		order.products[i].case_count = "";
		order.products[i].count_in_case = "";
		order.products[i].my_company_code = "";
		order.products[i].my_company_name = "";

		const utsumi_code = order.products[i].code.replace(/[{()}]/g, '');
		input_d1.setAttribute("placeholder", "マスター金額");
		input_b2.setAttribute("placeholder", "マスター商品名");

		const UTSUMI_NO_MASTER = "7961160";

		let codeFound = null;
		radio1.setAttribute("disabled", "disabled");
		radio2.setAttribute("disabled", "disabled");
		td_d1.classList.add("error");
		td_d2.classList.add("error");
	
		// Approach 1: Look at last 4 characters on the 
		
		let len = order.products[i].name.length;
		let frontCode = order.products[i].name.substr(0, 4);
		let endCode = order.products[i].name.substr(len - 4);
		
		frontCode = str_utils.wide_to_half(frontCode);
		endCode = str_utils.wide_to_half(endCode);
		
		let needle, code_from_name;

		if(endCode.length === 4) {
			code_from_name = endCode;
			needle = order.products[i].name.substr(0, len - 4);
		} else if(frontCode.length === 4) {
			code_from_name = frontCode;
			needle = order.products[i].name.substr(4);
		} else {
			needle = order.products[i].name;
		}
		
		if(code_from_name) {

			for(let k = 0; k < this.MEM.products.length; k++) {
				let p = this.MEM.products[k];
				if(p.my_company_code !== code_from_name) {
					continue;
				}

				codeFound = this.MEM.products[k];
				order.products[i].my_company_code = this.MEM.products[k].my_company_code;
				order.products[i].my_company_name = this.MEM.products[k].product_name;
				break;
			}

		}
	
		// In this case we try to loop through the existing products
		// to try and look for strings that match to some degree
		
		let haystack = this.MEM.products;

		input_f.value = "";

		let hits = [];
		input_a1.addEventListener('focus', this.EVT.handleCodeFocus);
		input_a1.addEventListener('blur', this.EVT.handleCodeBlur);
		const ul = document.createElement("ul");
		rel.appendChild(ul);
		order.products[i].my_company_code = "";
		order.products[i].my_company_name = "";

		// Approach 2, match strings exactly
		while(hits.length === 0 && needle.length > 1) {

			for(let k = 0; k < this.MEM.products.length; k++) {
				let p = this.MEM.products[k];
				if(p.product_name.indexOf(needle) === -1) {
					continue;
				}

				let hit = this.MEM.products[k];
				if(hits.indexOf(hit) !== -1) {
					continue;
				}

				hits.push(hit);
			}

			needle = needle.substring(0, needle.length - 1);

		}
			
		hits.forEach( hit => {
		
			const li = document.createElement("li");
			li.textContent = hit.my_company_code + " " + hit.product_name;
			ul.appendChild(li);

			li.userData = {
				ref : userData,
				info : hit
			}

			li.addEventListener('click', this.EVT.handleOptionClick);

		});
				

		if(!codeFound) {
			radio1.setAttribute("disabled", "disabled");
			radio2.setAttribute("disabled", "disabled");
			td_d1.classList.add("error");
			td_d2.classList.add("error");
			continue;
		}

		td_d1.classList.remove("error");
		td_d2.classList.remove("error");
		
		order.products[i].my_company_code = codeFound.my_company_code;
		order.products[i].my_company_name = codeFound.product_name;
		input_a1.setAttribute("readonly", "readonly");
		userData.price = [
			codeFound.utsumi_price, 
			order.products[i].price
		];
		
		let count, cases, calc_case_count;

		if(codeFound.case_count.indexOf(",") !== -1) {
			cases = parseFloat(codeFound.case_count.replace(",",""));
		} else {
			cases = parseFloat(codeFound.case_count);
		}
		if(order.products[i].count.indexOf(",") !== -1) {
			count = parseFloat(order.products[i].count.replace(",",""));
		} else {
			count = parseFloat(order.products[i].count);
		}

		calc_case_count = Math.ceil(count / cases);

		if(isNaN(calc_case_count)) {
			order.products[i].case_count = "";
			input_f.value = "";
		} else {
			order.products[i].count_in_case = cases;
			order.products[i].case_count = calc_case_count.toString();
			input_f.value = order.products[i].case_count;
		}

		input_a1.value = codeFound.my_company_code;
		input_d1.value = codeFound.utsumi_price;
		input_b2.value = codeFound.product_name;

		if(codeFound.utsumi_price !== order.products[i].price) {
			td_d1.classList.add("warn");
			td_d2.classList.add("warn");
			radio1.removeAttribute("disabled", "disabled");
			radio2.removeAttribute("disabled", "disabled");
			continue;
		}
		
		radio1.setAttribute("disabled", "disabled");
		radio2.setAttribute("disabled", "disabled");
		radio1.checked = true;

	}

	table.appendChild(thead);
	table.appendChild(tbody);
	div.appendChild(table);

	return div;
}

function api_matchProductCode(userData) {

	let elem = userData.code;
	let code = elem.value;
	let order = userData.data;

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
	userData.name_display.value = "";
		userData.price_display.value = "";
		userData.count_display.value = "";
		userData.data.case_count = "";
		userData.data.count_in_case = "";
		userData.data.my_company_code = "";
		userData.data.my_company_name = "";

		userData.radio[0].checked = false;
		userData.radio[1].checked = false;
		userData.radio[0].parentNode.parentNode.setAttribute("class", "d error");
		userData.radio[1].parentNode.parentNode.setAttribute("class", "d error");

		userData.radio[0].setAttribute("disabled", "disabled");
		userData.radio[1].setAttribute("disabled", "disabled");
	} else {
		userData.name_display.value = codeFound.product_name;
		userData.price_display.value = codeFound.utsumi_price;

		if(codeFound.utsumi_price === userData.data.price) {
			userData.radio[0].parentNode.parentNode.setAttribute("class", "d");
			userData.radio[1].parentNode.parentNode.setAttribute("class", "d");
			
			userData.radio[0].checked = true;
			userData.radio[1].checked = false;

			userData.radio[0].setAttribute("disabled", "disabled");
			userData.radio[1].setAttribute("disabled", "disabled");
	} else if(userData.radio[0].checked || userData.radio[1].checked) {
			userData.radio[0].parentNode.parentNode.setAttribute("class", "d edit");
			userData.radio[1].parentNode.parentNode.setAttribute("class", "d edit");

			userData.radio[0].removeAttribute("disabled");
			userData.radio[1].removeAttribute("disabled");
		} else {
			userData.radio[0].parentNode.parentNode.setAttribute("class", "d warn");
			userData.radio[1].parentNode.parentNode.setAttribute("class", "d warn");

			userData.radio[0].removeAttribute("disabled");
			userData.radio[1].removeAttribute("disabled");
		}

		userData.price = [
			codeFound.utsumi_price,
			userData.data.price
		];

		let count = parseFloat(order.count);
		let cases = parseFloat(codeFound.case_count);
		let calc_case_count = (count / cases);

		if(isNaN(calc_case_count)) {
			userData.data.case_count = "";
			userData.count_display.value = "";
		} else {
			userData.data.count_in_case = cases;
			userData.data.case_count = calc_case_count.toString();
			userData.count_display.value = userData.data.case_count;
		}
		
		userData.data.my_company_code = codeFound.my_company_code;
		userData.data.my_company_name = codeFound.product_name;

	}
	
	this.API.createCsv();

}

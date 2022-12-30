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
	api_renderHistoryMeta,
	api_renderHistoryBody,
	api_renderHistoryFoot,
	api_renderHistoryItem
}

function api_renderHistoryMeta(point, fixes) {

	const div = document.createElement("div");
	div.setAttribute("class", "meta");

	let row_0, t0, r0;

	// FIRST ROW

	row_0 = document.createElement("div");
	row_0.setAttribute("class", "row");

	t0 = document.createElement("table");
	r0 = t0.insertRow();

	const c0 = r0.insertCell();
	const c1 = r0.insertCell();
	const c2 = r0.insertCell();
	const c3 = r0.insertCell();

	c0.setAttribute("class", "label a");
	c1.setAttribute("class", "value a");
	c2.setAttribute("class", "label b");
	c3.setAttribute("class", "value b");

	c0.textContent = "注文No.";
	c1.textContent = point.order_no;
	c2.textContent = "納品日.";
	c3.textContent = moment(point.delivery_date).format("YY-MM-DD");

	row_0.appendChild(t0);
	div.appendChild(row_0);

	row_0 = document.createElement("div");
	row_0.setAttribute("class", "row");

	t0 = document.createElement("table");
	r0 = t0.insertRow();

	const c6 = r0.insertCell();
	const c7 = r0.insertCell();
	const c4 = r0.insertCell();
	const c5 = r0.insertCell();

	c4.setAttribute("class", "label c");
	c5.setAttribute("class", "value c");
	c6.setAttribute("class", "label d");
	c7.setAttribute("class", "value d");

	c4.textContent = "出荷確認日";
	c5.textContent = moment(point.shipment_confirmation_date).format("YY-MM-DD");
	c6.textContent = "得意先No.";
	c7.textContent = point.customer_no;

	row_0.appendChild(t0);
	div.appendChild(row_0);
	
	// SECOND ROW

	const row_1 = document.createElement("div");
	row_1.setAttribute("class", "row pad");

	const t1 = document.createElement("table");
	const r1 = t1.insertRow();

	const cf11 = r1.insertCell();
	const cf12 = r1.insertCell();

	const c8 = r1.insertCell();
	const c9 = r1.insertCell();
	const c10 = r1.insertCell();

	cf11.setAttribute("class", "label a");
	cf12.setAttribute("class", "value a fixed");

	cf11.textContent = "整理No.";
	cf12.textContent = point.reference_no;

	c8.setAttribute("class", "label e");
	c9.setAttribute("class", "value e");
	c10.setAttribute("class", "fix");

	c8.textContent = "問合先:";
	c9.textContent = point.contact;
	
	let arr = [];
	if(this.MEM.fixes) {
		this.MEM.fixes.forEach( obj => {
			arr.push(obj);
		});
	}

	if(fixes) {
		fixes.forEach( obj => {
			arr.push(obj);
		});
	}

	let ch;
	for(let i = 0; i < arr.length; i++) {

		let fix = arr[i];

		switch(parseInt(point.order_no)) {
		case fix.invalid_order_no:
			ch = "×";
			break;
		case fix.update_order_no:
			ch = "〇";
			break;
		case fix.remove_order_no:
			ch = "▽";
			break;
		}

		if(!ch) {
			continue;
		}

		point.status = ch;
			
		const span = document.createElement("span");
		span.setAttribute("class", "link");
		span.textContent = "修正 " + ch;
		c10.appendChild(span);

		span.userData = {
			order : point,
			fix : fix
		}

		span.addEventListener('click', this.EVT.handleSpanClick);
		break;

	}

	row_1.appendChild(t1);
	div.appendChild(row_1);

	return div;

}

function api_renderHistoryBody(point) {

	const div = document.createElement("div");
	div.setAttribute("class", "history-body");

	// Client Table
	
	const tb0 = document.createElement("div")
	tb0.setAttribute("class", "table");

	const ta = document.createElement("table");
	ta.setAttribute("border", "1");

	const ra = ta.insertRow();
	const ca0 = ra.insertCell();
	const ca1 = ra.insertCell();
	ca0.setAttribute("class", "label");
	ca1.setAttribute("class", "value");
	ca1.setAttribute("colspan", "3");
	ca0.textContent = "届先名";
	ca1.textContent = point.recipient.name;

	const rb = ta.insertRow();
	const cb0 = rb.insertCell();
	const cb1 = rb.insertCell();
	cb0.setAttribute("class", "label");
	cb1.setAttribute("class", "value");
	cb1.setAttribute("colspan", "3");
	cb0.textContent = "届先郵便番号";
	cb1.textContent = point.recipient.post;

	const rc = ta.insertRow();
	const cc0 = rc.insertCell();
	const cc1 = rc.insertCell();
	cc0.setAttribute("class", "label");
	cc1.setAttribute("class", "value");
	cc1.setAttribute("colspan", "3");
	cc0.textContent = "届先住所";
	cc1.textContent = point.recipient.addr;

	const rd = ta.insertRow();
	const cd0 = rd.insertCell();
	const cd1 = rd.insertCell();
	const cd2 = rd.insertCell();
	const cd3 = rd.insertCell();
	cd0.setAttribute("class", "label");
	cd1.setAttribute("class", "value");
	cd2.setAttribute("class", "label");
	cd3.setAttribute("class", "value");
	cd0.textContent = "届先担当";
	cd1.textContent = point.recipient.rep;
	cd2.textContent = "届先TEL";
	cd3.textContent = point.recipient.tel;
	
	tb0.appendChild(ta);
	div.appendChild(tb0);

	// Shipper Table

	const tb1 = document.createElement("div");
	tb1.setAttribute("class", "table");

	const tb = document.createElement("table");
	tb.setAttribute("border", "1");

	const re = tb.insertRow();
	const ce0 = re.insertCell();
	const ce1 = re.insertCell();
	ce0.setAttribute("class", "label");
	ce1.setAttribute("class", "value");
	ce0.textContent = "出荷人名";
	ce1.textContent = point.shipper.name;

	const rf = tb.insertRow();
	const cf0 = rf.insertCell();
	const cf1 = rf.insertCell();
	cf0.setAttribute("class", "label");
	cf1.setAttribute("class", "value");
	cf0.textContent = "出荷郵便番号";
	cf1.textContent = point.shipper.post;

	const rg = tb.insertRow();
	const cg0 = rg.insertCell();
	const cg1 = rg.insertCell();
	cg0.setAttribute("class", "label");
	cg1.setAttribute("class", "value");
	cg0.textContent = "出荷住所";
	cg1.textContent = point.shipper.addr;

	const rh = tb.insertRow();
	const ch0 = rh.insertCell();
	const ch1 = rh.insertCell();
	ch0.setAttribute("class", "label");
	ch1.setAttribute("class", "value");
	ch0.textContent = "出荷TEL ";
	ch1.textContent = point.shipper.tel;
	
	tb1.appendChild(tb);
	div.appendChild(tb1);

	// Products Table

	const tb2 = document.createElement("div");
	tb2.setAttribute("class", "table");

	const tc = document.createElement("table");
	tc.setAttribute("border", "1");

	const thead = document.createElement("thead");
	const th_r = document.createElement("tr");

	const th_a = document.createElement("th");
	const th_b = document.createElement("th");
	const th_c = document.createElement("th");
	const th_d = document.createElement("th");
	const th_e = document.createElement("th");

	tc.appendChild(thead);
	thead.appendChild(th_a);
	thead.appendChild(th_b);
	thead.appendChild(th_c);
	thead.appendChild(th_d);
	thead.appendChild(th_e);

	th_a.setAttribute('class', 'label a');
	th_b.setAttribute('class', 'label b');
	th_c.setAttribute('class', 'label c');
	th_d.setAttribute('class', 'label d');
	th_e.setAttribute('class', 'label e');

	th_a.textContent = "商品ｺｰﾄﾞ";
	th_b.textContent = "商品名";
	th_c.textContent = "数量";
	th_d.textContent = "単価";
	th_e.textContent = "金額";

	const tbody = document.createElement("tbody");
	tc.appendChild(tbody);
	
	point.products.forEach( product => {
		
		const row = tbody.insertRow();

		const cell_0 = row.insertCell();
		const cell_1 = row.insertCell();
		const cell_2 = row.insertCell();
		const cell_31 = row.insertCell();
		const cell_32 = row.insertCell();
		//const cell_4 = row.insertCell();

		cell_0.setAttribute("class", "va");
		cell_1.setAttribute("class", "vb");
		cell_2.setAttribute("class", "vc");
		cell_31.setAttribute("class", "vd");
		cell_32.setAttribute("class", "vd");
		//cell_4.setAttribute("class", "ve");

		cell_0.textContent = product.code;
		cell_1.textContent = product.name;
		cell_2.textContent = product.count;
		cell_31.textContent = product.price;
		//cell_32.textContent = "tbd";
		//cell_4.textContent = product.subtotal;
		cell_32.textContent = product.subtotal;

	});

	tb2.appendChild(tc);
	div.appendChild(tb2);


	return div;

}

function api_renderHistoryFoot(point) {

	const div = document.createElement("div");
	div.setAttribute("class", "footer");

	// First block
	
	const row_a = document.createElement("div");
	row_a.setAttribute("class", "row");

	const tbl_a = document.createElement("table");
	row_a.appendChild(tbl_a);

	const ra = tbl_a.insertRow();
	const c0 = ra.insertCell();
	const c1 = ra.insertCell();
	c0.setAttribute("class", "label a");
	c1.setAttribute("class", "value");
	c0.textContent = "備考:";
	c1.textContent = point.notes;

	const rb = tbl_a.insertRow();
	const c2 = rb.insertCell();
	const c3 = rb.insertCell();
	c2.setAttribute("class", "label a");
	c3.setAttribute("class", "value");
	c2.textContent = "★変更:";
	c3.textContent = point.has_change ? "有" : "";
	
	div.appendChild(row_a);

	// Second Block
	
	const row_b = document.createElement("div");
	row_b.setAttribute("class", "row");

	const tbl_b = document.createElement("table");
	row_b.appendChild(tbl_b);

	const rc = tbl_b.insertRow();
	const c4 = rc.insertCell();
	const c5 = rc.insertCell();
	c4.setAttribute("class", "label b");
	c5.setAttribute("class", "value");
	c4.textContent = "★送状記載事項:";
	c5.textContent = point.delivery_notice;

	const rd = tbl_b.insertRow();
	const c6 = rd.insertCell();
	const c7 = rd.insertCell();
	c6.setAttribute("class", "label b");
	c7.setAttribute("class", "value");
	c6.textContent = "★出荷連絡事項:";
	c7.textContent = point.shipper_notice;
		
	div.appendChild(row_b); 
	return div;

}

function api_renderHistoryItem(point, fixes) {

	const li = document.createElement("li");

	const meta = this.API.renderHistoryMeta(point, fixes);
	const body = this.API.renderHistoryBody(point);
	const foot = this.API.renderHistoryFoot(point);

	li.appendChild(meta);
	li.appendChild(body);
	li.appendChild(foot);

	return li;

}

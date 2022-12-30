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

const Nav = (function() {

	this.MEM = {
		logged_in : false
	}

	this.DOM = {
		index : document.getElementById('Nav.index'),
		session : {
			login : document.getElementById('Nav.session.login'),
			app : document.getElementById('Nav.session.app'),
			logout : document.getElementById('Nav.session.logout'),
			debug : document.getElementById('Nav.session.debug'),
			name : document.getElementById('Nav.session.name')
		},
		link : {
			c100 : document.getElementById('Nav.link.c100'),
			c400 : document.getElementById('Nav.link.c400'),
			c450 : document.getElementById('Nav.link.c450'),
			c500 : document.getElementById('Nav.link.c500'),
			c600 : document.getElementById('Nav.link.c600'),
			search : document.getElementById('Nav.link.search'),
		},
		page : {
			c100 : document.getElementById('Nav.page.c100'),
			c400 : document.getElementById('Nav.page.c400'),
			c450 : document.getElementById('Nav.page.c450'),
			c500 : document.getElementById('Nav.page.c500'),
			c600 : document.getElementById('Nav.page.c600'),
			search : document.getElementById('Nav.page.search'),
		}
	}

	this.EVT = {
		handleWindowMessage : evt_handleWindowMessage.bind(this),
		handleLinkClick : evt_handleLinkClick.bind(this),
		handleLogoutClick : evt_handleLogoutClick.bind(this)
	}

	this.API = {
		openPage : api_openPage.bind(this),
		checkLoginStatus : api_checkLoginStatus.bind(this),
		initSession : api_initSession.bind(this),
	}

	init.apply(this);
	return this;

	function init() {

		for(let key in this.DOM.link) {
			this.DOM.link[key].addEventListener('click', this.EVT.handleLinkClick);
		}
		this.DOM.session.logout.addEventListener('click', this.EVT.handleLogoutClick);

		this.DOM.index.textContent = "";
		setTimeout( () => {
			this.API.checkLoginStatus();
		}, 400);

		// Debug password reset
		
		window.addEventListener("message", this.EVT.handleWindowMessage);

		this.DOM.link.c100.innerText = "内海商品管理";
		this.DOM.link.c400.innerText = "内海注文";
		this.DOM.link.c450.innerText = "ジャンブレ商品管理";
		this.DOM.link.c500.innerText = "ジャンブレ注文";
		this.DOM.link.c600.innerText = "フォーレスト(CSV)";
		this.DOM.link.search.innerText = "検索 (電子帳簿)";

	}

	function evt_handleWindowMessage(evt) {

		if(evt.data.code === 'refresh') {
			let key = evt.data.args;
			let page = this.DOM.page[key];

			if(!page) {
				return;
			}

			// page.refresh();

			const init = {
				code : "init",
				args : null
			};

			page.contentWindow.postMessage(init);
		}


	}


	async function evt_handleLogoutClick(evt) {

		let data;

		try {
			const req = await fetch('/session/handleLogout');
			data = await req.json();
		} catch(err) {
			throw err;
		}

		if(!data) {
			alert("There was an error loggin out!");
		}
		
		window.location.href = "index.html";

	}

	function evt_handleLinkClick(evt) {

		if(!this.MEM.logged_in) {
			return;
		}

		let elem = evt.target;
		let id = elem.getAttribute('id');
		let leaf = id.split('.').pop();
		this.API.openPage(leaf);

	}

	function api_openPage(leaf) {

		for(let key in this.DOM.link) {
			this.DOM.link[key].classList.remove("active");
		}

		for(let key in this.DOM.page) {
			this.DOM.page[key].classList.remove("active");
		}

		this.DOM.link[leaf].classList.add("active");
		this.DOM.page[leaf].classList.add("active");
		
		this.DOM.index.textContent = leaf.toUpperCase();
		localStorage.setItem("data-page", leaf)

	}

	async function api_checkLoginStatus() {

		let data;

		try {
			const req = await fetch('/session/getLoginStatus');
			data = await req.json();
		} catch(err) {
			throw err;
		}

		this.API.initSession(data.session_data);

	}

	function api_initSession(session_data) {


		this.MEM.session_data = session_data;
		this.MEM.logged_in = true;
		this.DOM.session.name.textContent = session_data.staff_email;

		const init = {
			code : "init",
			args : null
		};

		let lastPage = localStorage.getItem("data-page");
		if(!lastPage) {
			lastPage = 'c400';
		}
		this.API.openPage(lastPage);

		this.DOM.page.c100.contentWindow.postMessage(init);
		this.DOM.page.c450.contentWindow.postMessage(init);

	}

}).apply({});

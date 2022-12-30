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
		form : {
			login : document.getElementById('Nav.form.login'),
			reset : document.getElementById('Nav.form.reset')
		},
		login : {
			forgot : document.getElementById('Nav.login.forgot'),
			username : document.getElementById('Nav.login.username'),
			password : document.getElementById('Nav.login.password'),
			submit : document.getElementById('Nav.login.submit'),
			remember : document.getElementById('Nav.login.remember'),
			msg : document.getElementById('Nav.login.msg')
		},
		reset : {
			back : document.getElementById('Nav.reset.back'),
			display : document.getElementById('Nav.reset.display'),
			steps : document.getElementById('Nav.reset.steps'),
			ipt_username : document.getElementById('Nav.reset.ipt_username'),
			btn_otp_send : document.getElementById('Nav.reset.btn_otp_send'),
			mail_icon : document.getElementById('Nav.reset.mail_icon'),
			lights : document.getElementById('Nav.reset.lights'),
			ipt_opt_code : document.getElementById('Nav.reset.ipt_otp_code'),
			btn_otp_conf : document.getElementById('Nav.reset.btn_otp_conf'),
			ipt_password : document.getElementById('Nav.reset.ipt_password'),
			ipt_confirm : document.getElementById('Nav.reset.ipt_confirm'),
			btn_update : document.getElementById('Nav.reset.btn_update')
		}
	}

	this.EVT = {
		handleLinkClick : evt_handleLinkClick.bind(this),
		// handleDebugLogin : evt_handleDebugLogin.bind(this),
		handleLogoutClick : evt_handleLogoutClick.bind(this),
		handleForgotClick : evt_handleForgotClick.bind(this),
		handleBackClick : evt_handleBackClick.bind(this),
		handleOtpSendClick : evt_handleOtpSendClick.bind(this),
		handleOtpConfClick : evt_handleOtpConfClick.bind(this),
		handlePasswordUpdate : evt_handlePasswordUpdate.bind(this),
		handleLoginSubmit : evt_handleLoginSubmit.bind(this)
	}

	this.API = {
		openPage : api_openPage.bind(this),
		//renderDebugUsers : api_renderDebugUsers.bind(this),
		checkLoginStatus : api_checkLoginStatus.bind(this),
		initSession : api_initSession.bind(this),
		setStep : api_setStep.bind(this),
		animateEmail :  api_animateEmail.bind(this),
		setLight : api_setLight.bind(this),
		clearResetForm : api_clearResetForm.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		if(localStorage.getItem('username')) {
			this.DOM.login.username.value = localStorage.getItem('username');
			this.DOM.login.remember.checked = true;
		}
	
		if(localStorage.getItem('password')) {
			this.DOM.login.password.value = localStorage.getItem('password');
		}

		setTimeout( () => {
			this.API.checkLoginStatus();
		}, 400);

		this.DOM.login.forgot.addEventListener('click', this.EVT.handleForgotClick);
		this.DOM.reset.back.addEventListener('click', this.EVT.handleBackClick);

		// Debug password reset
		
		this.DOM.reset.btn_otp_send.addEventListener('click', this.EVT.handleOtpSendClick);
		this.DOM.reset.btn_otp_conf.addEventListener('click', this.EVT.handleOtpConfClick);
		this.DOM.reset.btn_update.addEventListener('click', this.EVT.handlePasswordUpdate);
		this.DOM.login.submit.addEventListener('click', this.EVT.handleLoginSubmit);

		this.API.clearResetForm();

	}

	async function evt_handleLoginSubmit(evt) {
	
		evt.preventDefault();

		const username = this.DOM.login.username.value;
		const password = this.DOM.login.password.value;
		const remember = this.DOM.login.remember.checked;

		const params = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				username,
				password,
				remember
			})
		}

		let res;
		try {
			const req = await fetch('/session/handleLogin', params);
			res = await req.json();
		} catch(err) {
			throw err;
		}

		console.log(res);

		if(res.err) {
			
			this.DOM.login.msg.innerHTML = "";

			switch(res.err) {
			case 1000:
				this.DOM.login.msg.textContent = "ユーザ名は正しくありません"
				break;
			case 1001:
				this.DOM.login.msg.appendChild(document.createTextNode('アカウントはロックしています'));
				this.DOM.login.msg.appendChild(document.createElement('br'));
				this.DOM.login.msg.appendChild(document.createTextNode('パスワードをリセットしてください'));
				break;
			case 1002:

				this.DOM.login.msg.textContent = "パスワードは不正です。後" + res.count + "回異なるとロックします";
				/*
				this.DOM.login.msg.appendChild(document.createTextNode('パスワードは不正です'));
				this.DOM.login.msg.appendChild(document.createElement('br'));
				this.DOM.login.msg.appendChild(document.createTextNode("後" + res.count + "回異なるとロックします"));
				*/
				break;
			case 1003:
				this.DOM.login.msg.appendChild(document.createTextNode('アカウントはロックしました'));
				this.DOM.login.msg.appendChild(document.createElement('br'));
				this.DOM.login.msg.appendChild(document.createTextNode('パスワードをリセットしてください'));
				break;
			}

			if(this.MEM.msg_time) {
				clearTimeout(this.MEM.msg_time);
			}
			
			this.DOM.login.msg.parentNode.classList.add("show");
			this.MEM.msg_time = setTimeout( () => {
				this.DOM.login.msg.parentNode.classList.remove("show");
			}, 4000);
			
			return;
		}

		if(remember) {
			localStorage.setItem('username', username);
			localStorage.setItem('password', password);
		} else {
			localStorage.removeItem('username');
			localStorage.removeItem('password');
		}

		// this.API.initSession(res);
		window.location.href = 'convert.html';

	}

	function api_clearResetForm() {

		this.DOM.reset.ipt_username.value = "";
		this.DOM.reset.ipt_opt_code.value = "";
		this.DOM.reset.ipt_password.value = "";
		this.DOM.reset.ipt_confirm.value = "";

		delete this.MEM.username;
		delete this.MEM.token;
		delete this.MEM.alter_uuid;

		this.DOM.form.login.classList.remove('hide');
		this.DOM.form.reset.classList.add('hide');

	}

	async function evt_handlePasswordUpdate(evt) {

		console.log("update password!!!");

		let pword = this.DOM.reset.ipt_password.value;
		let pconf = this.DOM.reset.ipt_confirm.value;

		let errors = [];
		if(pword.length < 4) {
			errors.push("Must be at least 4 characters");
		}

		if(/\s/g.test(pword)) {
			errors.push("Password cannot contain whitespace");
		}

		if(pword !== pconf) {
			errors.push("Confirmation password does not match");
		}

		if(!/^[0-9a-zA-Z]+$/.test(pword)) {
			errors.push("Password can only contain letters and numbers");
		}

		if(errors.length) {
			alert(errors.join("\n"));
			return;
		}

		let res;

		try {
			res = await Jaxer.API.updateAndLogin(this.MEM.username, pword, this.MEM.alter_uuid);
		} catch(err) {
			throw err;
		}

		console.log(res);

		if(res.err) {
			alert(res.msg);
			this.API.setStep(1);
			return;
		}

		this.API.initSession(res)

	}

	async function evt_handleOtpConfClick(evt) {

		//var token = this.DOM.reset.ipt_otp_code.value;
		let token = this.DOM.reset.ipt_opt_code.value;
		console.log(token);

		if(token.length !== 6) {
			return;
		}
		this.MEM.token = token;

		let res;

		try {
			res = await Jaxer.API.checkOneTimePass(this.MEM.username, this.MEM.token);
		} catch(err) {
			throw err;
		}

		if(res.err) {
			return alert(res.msg);
		}

		this.MEM.alter_uuid = res.msg;
		this.API.setStep(4);

		setTimeout( () => {
			this.DOM.reset.btn_otp_conf.value = "";
		}, 50);

	}

	async function api_animateEmail() {

		console.log("animating email!!!");

		// Start animating the icon

		this.DOM.reset.mail_icon.classList.add('send');
		setTimeout( () => {
			this.DOM.reset.mail_icon.classList.remove('send');
			this.API.setLight(-1);
		}, 5500);

		// Animate the lights

		for(let i = 0; i < 5; i++) {
			console.log(i);
			await this.API.setLight(i);
		}

		// Once we're done move to the next step 
		
		if(this.MEM.cancel) {
			return;
		}

		setTimeout( () => {
			if(this.MEM.cancel) {
				return;
			}

			this.API.setStep(3);
		}, 400);

	}

	function api_setLight(index) {

		return new Promise( (resolve, reject) => {

			this.DOM.reset.lights.classList.remove("n01");
			this.DOM.reset.lights.classList.remove("n02");
			this.DOM.reset.lights.classList.remove("n03");
			this.DOM.reset.lights.classList.remove("n04");
			this.DOM.reset.lights.classList.remove("n05");

			switch(index) {
			case 0:
				this.DOM.reset.lights.classList.add("n01");
				break;
			case 1:
				this.DOM.reset.lights.classList.add("n02");
				break;
			case 2:
				this.DOM.reset.lights.classList.add("n03");
				break;
			case 3:
				this.DOM.reset.lights.classList.add("n04");
				break;
			case 4:
				this.DOM.reset.lights.classList.add("n05");
				break;
			}

			setTimeout( () => {
				resolve();
			}, 1000);

		});

	}

	function api_setStep(step) {

		this.DOM.reset.display.classList.remove("step01");
		this.DOM.reset.display.classList.remove("step02");
		this.DOM.reset.display.classList.remove("step03");
		this.DOM.reset.display.classList.remove("step04");
		
		this.DOM.reset.steps.classList.remove("step01");
		this.DOM.reset.steps.classList.remove("step02");
		this.DOM.reset.steps.classList.remove("step03");
		this.DOM.reset.steps.classList.remove("step04");
		
		switch(step){
		case 1:
			this.DOM.reset.display.classList.add("step01");
			this.DOM.reset.steps.classList.add("step01");
			break;
		case 2:
			this.DOM.reset.display.classList.add("step02");
			this.DOM.reset.steps.classList.add("step02");

			setTimeout( () => {
				this.API.animateEmail();
			}, 100);

			break;
		case 3:
			this.DOM.reset.display.classList.add("step03");
			this.DOM.reset.steps.classList.add("step03");
			break;
		case 4:
			this.DOM.reset.display.classList.add("step04");
			this.DOM.reset.steps.classList.add("step04");
			break;
		}

	}

	async function evt_handleOtpSendClick(evt) {

		evt.preventDefault();
		this.MEM.cancel = false;
		this.DOM.reset.ipt_username.classList.remove("error");

		let username = this.DOM.reset.ipt_username.value;
		if(!str_utils.validate_email(username)) {
			alert("Email is not valid");
			return;
		}

		this.MEM.username = username;
		console.log(this.DOM.reset)
		console.log(this.DOM.reset.ipt_opt_code);

		this.DOM.reset.ipt_opt_code.value = "";

		let res;
		this.API.setStep(2);

		try {
			res = await Jaxer.API.sendOneTimePass(username);
		} catch(err) {
			throw err;
		}

		if(!res.err) {
			return;
		}

		this.API.setStep(1);
		this.MEM.cancel = true;
		this.DOM.reset.ipt_username.classList.add("error");

	}

	function evt_handleBackClick() {
		
		this.DOM.form.login.classList.remove('hide');
		this.DOM.form.reset.classList.add('hide');
		this.API.setStep(1);

		this.DOM.reset.ipt_password.value = "";
		this.DOM.reset.ipt_confirm.value = "";

	}

	function evt_handleForgotClick(evt) {

		this.DOM.form.login.classList.add('hide');
		this.DOM.form.reset.classList.remove('hide');

		let username = this.DOM.login.username.value;
		this.DOM.reset.ipt_username.value = username;
		this.API.setStep(1);

	}

	async function evt_handleLogoutClick(evt) {

		console.log("handle logout click!!");

		let data;

		try {
			data = await Jaxer.API.setLoginStatus();
		} catch(err) {
			throw err;
		}

		if(!data) {
			alert("There was an error loggin out!");
		}
	
		this.DOM.session.login.classList.remove("hide");
		this.DOM.session.name.textContent = "";
		this.MEM.logged_in = false;
		this.DOM.index.textContent = "";

		for(let key in this.DOM.link) {
			this.DOM.link[key].classList.remove("active");
		}

		for(let key in this.DOM.page) {
			this.DOM.page[key].classList.remove("active");
		}

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

	/*
	async function api_renderDebugUsers() {

		let data;

		try {
			data = await Jaxer.API.getUserList();
		} catch(err) {
			throw err;
		}
		
		this.DOM.session.debug.innerHTML = "";

		data.forEach(user => {
			
			let li = document.createElement("li");
			li.setAttribute("data-uuid", user.staff_uuid);
			li.textContent = user.staff_email;
			this.DOM.session.debug.appendChild(li);

		});

	}

	async function evt_handleDebugLogin(evt) {

		let elem = evt.target;
		let user_uuid = elem.getAttribute("data-uuid");

		let result;

		try {
			result = await Jaxer.API.debugLogin(user_uuid);
		} catch(err) {
			throw err;
		}
	
		if(!result) {
			alert("Could not handle login");
			return;
		}

		this.API.initSession(result);

	}
	*/

	async function api_checkLoginStatus() {

		console.log("check login status!");

		let data;

		try {
			const req = await fetch('/session/getLoginStatus');
			data = await req.json();
		} catch(err) {
			throw err;
		}

		if(data.err) {
			return;
		}

		// this.API.initSession(data.session_data);
		window.location.href = 'convert.html';

	}

	function api_initSession(session_data) {

		if(!localStorage.getItem("password")) {
			this.DOM.login.password.value = "";
		}

		this.MEM.session_data = session_data;
		this.DOM.session.login.classList.add("hide");
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
		// this.DOM.page.c200.contentWindow.postMessage(init);
		
		this.API.clearResetForm();

	}

}).apply({});

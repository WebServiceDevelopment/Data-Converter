/*++

	Web Service Development 
	Copyright 2019, 2022 All Rights Reserved.

	NOTICE:  All information contained herein is, and remains
	the property of Web Service Development and its suppliers,
	if any.  The intellectual and technical concepts contained
	herein are proprietary to Web Service Development and its
	suppliers and may be covered by U.S. and Foreign Patents,
	patents in process, and are protected by trade secret or
	copyright law. Dissemination of this information or
	reproduction of this material is strictly forbidden unless
	prior written permission is obtained from Web Service
	Development Inc.

	By: Benjmain Collins (collins@wsd.co.jp)

--*/

"use strict";


/*++

	Import Libraries

--*/

const fs = require('fs');
const http = require('http');
const express = require('express');
const httpProxy = require('http-proxy');
const bodyParser = require('body-parser');
const normalizeHeaderCase = require('header-case-normalizer');
const fileUpload = require('express-fileupload');

// Session 

const session = require("express-session")
const RedisStore = require("connect-redis")(session)
const { createClient } = require('redis')
const redisClient = createClient()

// Define Constants 

const PUBLIC_DIR = 'public';

// Define Application

const app = express();

// Define Application Middleware

app.use(bodyParser.json({limit: '50mb'}));
app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 }
}));

app.use(session({
	store: new RedisStore({ client: redisClient }),
	saveUninitialized: false,
	secret: "keyboard cat",
	resave: false,
}));

// Define Application Routes

app.use('/ipfs', require('./routes/ipfs.js'));
app.use('/orders', require('./routes/orders.js'));
app.use('/janbure', require('./routes/janbure.js'));
app.use('/utsumi', require('./routes/utsumi.js'));
app.use('/session', require('./routes/session.js'));

// Forward to latest version

// Start Application

app.use(express.static(PUBLIC_DIR));
const server = http.createServer(app);
server.listen(3000);

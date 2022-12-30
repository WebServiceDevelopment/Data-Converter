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

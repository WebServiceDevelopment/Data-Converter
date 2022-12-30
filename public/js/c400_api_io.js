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
	api_storePdf,
	api_readPdfFile
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

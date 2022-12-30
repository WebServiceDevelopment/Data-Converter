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
	api_analysisPdfText,
}

async function api_analysisPdfText(pdf, file) {
	const from=[
		{"com":'株式会社 ウェブサービス・ディベロップメント',"fn":this.PDF.wsd},
		{"com":'内海産業（株）',"fn":this.PDF.utsumi}
	]
		
	const pagesPromises = [];

	for (let i = 0; i < pdf.numPages; i++) {

		pagesPromises.push(  await getPageText(i+1, pdf) );

	}

	Promise.all(pagesPromises).then( async pagesText => {
		
		const all = [];
		let fn  = null;

		pagesText.forEach( page => {
			let i,j;
			
			for(i = 0; i < page.length; i++) {

				let line = page[i];

				if( fn == null) {
					fn = setFunc(line , from);
				}

				//console.log(line);
				all.push(line);
			}

		});
		
		if(fn == null) {
			alert("ファイルの解析が出来ません.\n取り込み対象外の形式です.");
			return;
		}

		let processed = fn(all);
		this.API.handleProcessed(processed);

		this.API.storeIpfs(processed, file);

		return;
		function setFunc(line , from) {
			for(let j = 0; j < from.length; j++) {
				if(line.indexOf(from[j].com) === 0) {
					return from[j].fn;
				}
			} 
			return null;
		}
		
	}, function(reason) {
		console.error(reason);
	});

}


function getPageText(pageNum, PDFDocumentInstance) {

	return new Promise(function (resolve, reject) {
		PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {

			pdfPage.getTextContent({ normalizeWhitespace: true }).then(function (textContent) {

				const scale = 1.0;
				const viewport = pdfPage.getViewport({ scale: scale });
				const PDFJS = window.pdfjsLib;

				let finalObj = [];
				let obj;

				textContent.items.forEach(function (textItem) {

					let tx = PDFJS.Util.transform(viewport.transform, textItem.transform);

					obj = {"str":textItem.str,
						"x":parseInt(tx[4]),
						"y":parseInt(tx[5])
						};

					finalObj.push(obj);
				});

				finalObj.sort(compareY).sort(compareX);

				let finalString = [];

				for (let i = 0; i < finalObj.length; i++) {
					let o = finalObj[i];
					//console.log(o.str+":"+o.x+":"+o.y);
					finalString.push( finalObj[i].str);
				}

				resolve(finalString);

			});
		});
	});

	function compareX( a, b ){
		if( a.y != b.y ) { return 0; }
		if( a.x < b.x ) { return -1; }
		if( a.x > b.x ) { return 1; }

		return 0;
	}

	function compareY( a, b ){
		if( a.y < b.y ){ return -1; }
		if( a.y > b.y ){ return 1; }

		return 0;
	}

}


"use strict";

const str_utils = {

	wide_to_half : function(source) {

		let latin = "";

		const wide = [
			'０', '１', '２', '３',
			'４', '５', '６', '７',
			'８', '９', 'Ａ', 'Ｂ',
			'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ',
			'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ',
			'Ｋ', 'Ｌ', 'Ｍ', 'Ｎ',
			'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ',
			'Ｓ', 'Ｔ', 'Ｕ', 'Ｖ',
			'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
		];

		const half = [
			'0', '1', '2', '3',
			'4', '5', '6', '7',
			'8', '9', 'A', 'B',
			'C', 'D', 'E', 'F',
			'G', 'H', 'I', 'J',
			'K', 'L', 'M', 'N',
			'O', 'P', 'Q', 'R',
			'S', 'T', 'U', 'V',
			'W', 'X', 'Y', 'Z'
		];

		for(let i = 0; i < source.length; i++) {
			let ch = source.charAt(i);
			
			if(half.indexOf(ch) !== -1) {
				latin += ch;
				continue;
			}

			let index = wide.indexOf(ch);
			if(index === -1) {
				continue;
			}
			latin += half[index];
		}

		return latin;

	},

	remove_numbers : function(source) {
		
		let str = "";

		const numbers = [
			'０', '１', '２', '３', '４', 
			'５', '６', '７', '８', '９',
			'0', '1', '2', '3', '4', 
			'5', '6', '7', '8', '9'
		];

	},

	validate_email : function(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}


};

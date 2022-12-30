"use strict";

(function() {

	let outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar";
	document.body.appendChild(outer);

	let widthNoScroll = outer.offsetWidth;
	outer.style.overflow = "scroll";

	let inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);
	var widthWithScroll = inner.offsetWidth;
	outer.parentNode.removeChild(outer);

	let scrollWidth = widthNoScroll - widthWithScroll;
	let sheet = document.styleSheets[0];
	let text = 'html { --scroll-width: ' + scrollWidth + 'px; }'
	sheet.insertRule(text);

})();

/* lite-embed.js — click-to-load facade for embedded YouTube videos.
   Renders a static thumbnail + play button; the real <iframe> is only
   created on click/Enter/Space, so the YouTube iframe/JS payload is
   never fetched unless a visitor actually presses play. The facade is a
   native <button>, so Enter/Space activation is handled by the browser --
   only the click event needs a listener here. */
(function () {
	"use strict";

	function activate(facade) {
		if (facade.hasAttribute("data-activated")) return;
		facade.setAttribute("data-activated", "true");

		var iframe = document.createElement("iframe");
		iframe.setAttribute("src", facade.getAttribute("data-src"));
		iframe.setAttribute("title", facade.getAttribute("data-title") || "");
		iframe.setAttribute(
			"allow",
			facade.getAttribute("data-allow") ||
				"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
		);
		iframe.setAttribute("allowfullscreen", "");
		iframe.setAttribute("width", facade.getAttribute("data-width") || "560");
		iframe.setAttribute("height", facade.getAttribute("data-height") || "315");
		iframe.className = "yt-facade-iframe";

		facade.innerHTML = "";
		facade.appendChild(iframe);
		iframe.focus();
	}

	function init() {
		var facades = document.querySelectorAll(".yt-facade");
		for (var i = 0; i < facades.length; i++) {
			facades[i].addEventListener("click", function (e) {
				activate(e.currentTarget);
			});
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

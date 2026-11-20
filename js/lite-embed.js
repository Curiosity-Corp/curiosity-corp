/* lite-embed.js — click-to-load facades for embedded iframes (YouTube
   videos, the contact-page map). Renders a static placeholder; the real
   <iframe> is only created on click/Enter/Space, so the third-party
   iframe payload is never fetched unless a visitor asks for it. The
   facade is a native <button>, so Enter/Space activation is handled by
   the browser -- only the click event needs a listener here.

   Facade attributes:
     data-src           iframe URL (required)
     data-title         iframe title, for screen readers
     data-allow         iframe allow list (default: YouTube's set)
     data-width/height  iframe size attributes (default 560x315)
     data-iframe-class  iframe class (default "yt-facade-iframe")
     data-replace       present: the iframe replaces the button instead of
                        being placed inside it (an interactive map must not
                        live inside a <button>) */
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
		iframe.setAttribute("loading", "lazy");
		iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
		iframe.setAttribute("width", facade.getAttribute("data-width") || "560");
		iframe.setAttribute("height", facade.getAttribute("data-height") || "315");
		iframe.className = facade.getAttribute("data-iframe-class") || "yt-facade-iframe";

		if (facade.hasAttribute("data-replace")) {
			facade.parentNode.replaceChild(iframe, facade);
		} else {
			facade.innerHTML = "";
			facade.appendChild(iframe);
		}
		iframe.focus();
	}

	function init() {
		var facades = document.querySelectorAll(".yt-facade, .map-facade");
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

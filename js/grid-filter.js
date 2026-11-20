/* ==================================================
   Filterable card/gallery grids (GitLab #21).
   Replaces the GPLv3-or-commercial masonry library the theme
   shipped with (removal recorded in LICENSES.md). Layout is
   pure CSS Grid (.filter-grid in css/custom.css); this file
   only shows/hides items for the filter buttons.

   Markup contract (unchanged from the theme):
     <ul class="sort-source" data-sort-id="X">
       <li data-option-value="*"><a href="#">All</a></li>
       <li data-option-value=".cat"><a href="#">Cat</a></li>
     </ul>
     <ul class="sort-destination filter-grid" data-sort-id="X">
       <li class="grid-item cat">...</li>
     </ul>
   A filter value is "*" or ".class-name"; only values that a
   button on the page offers are ever applied, so a crafted
   URL hash cannot inject an arbitrary selector. The active
   filter is mirrored in location.hash ("#cat") so filtered
   views stay linkable, as before.
================================================== */
(function () {
	"use strict";

	var ALL = "*";

	function initGrid(source) {
		var sortId = source.getAttribute("data-sort-id");
		var grid = document.querySelector('ul.sort-destination[data-sort-id="' + sortId + '"]');
		if (!grid) return;

		var buttons = Array.prototype.slice.call(source.querySelectorAll("li[data-option-value]"));
		var offered = buttons.map(function (li) {
			return li.getAttribute("data-option-value");
		});
		var items = Array.prototype.slice.call(grid.children);

		function fromHash() {
			var name = decodeURIComponent(location.hash.replace(/^#/, ""));
			if (name === "" || name === ALL) return ALL;
			var value = "." + name;
			return offered.indexOf(value) === -1 ? null : value;
		}

		function apply(value) {
			buttons.forEach(function (li) {
				var on = li.getAttribute("data-option-value") === value;
				li.classList.toggle("active", on);
				var link = li.querySelector("a");
				if (link) link.setAttribute("aria-pressed", on ? "true" : "false");
			});
			var cls = value === ALL ? null : value.slice(1);
			items.forEach(function (item) {
				item.hidden = cls !== null && !item.classList.contains(cls);
			});
		}

		buttons.forEach(function (li) {
			var link = li.querySelector("a");
			if (!link) return;
			link.setAttribute("role", "button");
			link.addEventListener("click", function (e) {
				e.preventDefault();
				var value = li.getAttribute("data-option-value");
				apply(value);
				var name = value === ALL ? "" : value.slice(1);
				if (name !== "" || location.hash !== "") {
					history.replaceState(null, "", name === "" ? location.pathname + location.search : "#" + name);
				}
			});
		});

		window.addEventListener("hashchange", function () {
			var value = fromHash();
			if (value !== null) apply(value);
		});

		apply(fromHash() || ALL);
	}

	function init() {
		document.querySelectorAll("ul.sort-source[data-sort-id]").forEach(initGrid);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

/* circle-progress.js — vanilla replacement for jquery-circle-progress.
   SOP §19 (retire jQuery): the old plugin drew an animated <canvas>
   arc via jQuery's .animate()-driven step callback. This version
   builds a native SVG circle per `.cProgress` element and animates
   stroke-dashoffset with requestAnimationFrame, matching the original
   visual (size 60px, ease-out fill, live "NN%" text) with zero
   dependency and a compositor-friendly animated property (a stroke
   dash offset is paint-bound like the old canvas draw, but it now
   only runs once per element, gated by IntersectionObserver, instead
   of on every jQuery .animate() step queued at page load). */
(function () {
	"use strict";

	var SIZE = 60;
	var STROKE = 4;
	var RADIUS = (SIZE - STROKE) / 2;
	var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
	var DURATION = 1200;

	function easeOutCubic(t) {
		return 1 - Math.pow(1 - t, 3);
	}

	function buildSvg(color) {
		var svgNS = "http://www.w3.org/2000/svg";
		var svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("viewBox", "0 0 " + SIZE + " " + SIZE);
		svg.setAttribute("aria-hidden", "true");

		var track = document.createElementNS(svgNS, "circle");
		track.setAttribute("class", "cProgress-track");
		track.setAttribute("cx", SIZE / 2);
		track.setAttribute("cy", SIZE / 2);
		track.setAttribute("r", RADIUS);

		var fill = document.createElementNS(svgNS, "circle");
		fill.setAttribute("class", "cProgress-fill");
		fill.setAttribute("cx", SIZE / 2);
		fill.setAttribute("cy", SIZE / 2);
		fill.setAttribute("r", RADIUS);
		fill.setAttribute("stroke", color);
		fill.style.strokeDasharray = CIRCUMFERENCE;
		fill.style.strokeDashoffset = CIRCUMFERENCE;

		svg.appendChild(track);
		svg.appendChild(fill);
		return { svg: svg, fill: fill };
	}

	function animate(el, fill, textEl, targetPercent) {
		var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reducedMotion) {
			fill.style.strokeDashoffset = CIRCUMFERENCE * (1 - targetPercent / 100);
			if (textEl) textEl.innerHTML = Math.round(targetPercent) + "<i>%</i>";
			return;
		}

		var start = null;
		function step(timestamp) {
			if (start === null) start = timestamp;
			var elapsed = timestamp - start;
			var progress = Math.min(elapsed / DURATION, 1);
			var eased = easeOutCubic(progress);
			fill.style.strokeDashoffset = CIRCUMFERENCE * (1 - (eased * targetPercent) / 100);
			if (textEl) textEl.innerHTML = Math.round(eased * targetPercent) + "<i>%</i>";
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function init() {
		var elements = document.querySelectorAll(".cProgress");
		if (!elements.length) return;

		var observer = new IntersectionObserver(
			function (entries, obs) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					var el = entry.target;
					obs.unobserve(el);
					var percent = parseFloat(el.getAttribute("data-complete")) || 0;
					var color = el.getAttribute("data-color") || "d82e67";
					var built = buildSvg("#" + color);
					el.insertBefore(built.svg, el.firstChild);
					animate(el, built.fill, el.querySelector("strong"), percent);
				});
			},
			{ rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
		);

		elements.forEach(function (el) {
			observer.observe(el);
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

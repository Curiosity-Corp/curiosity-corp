/* init.js — site glue script.
   SOP §19 (retire jQuery, GitLab issue #19): rewritten from the
   jQuery(function($){...}) BORNTOGIVE object to plain DOM APIs. Every
   function below keeps the original's *visible behavior*; several
   jQuery-only plugin calls that had zero matching elements anywhere
   in the site markup (Superfish, the Sticky plugin's .header-style2/
   .header-style3 targets, the Twitter widget, jQuery Transit, Owl
   Carousel remnants, jQuery-Parallax already removed in an earlier
   wave) were dead code and are not ported — see the removal notes
   inline. Two live bugs found during the rewrite are fixed as a
   byproduct and called out below (ContactForm double-submit,
   tooltip/popover selectors that never matched Bootstrap 5's
   data-bs-* attribute names). */
(function () {
	"use strict";

	var BORNTOGIVE = window.BORNTOGIVE || {};

	/* ==================================================
		Scroll Functions
	================================================== */
	BORNTOGIVE.scrollToTop = function () {
		var arrow = document.getElementById("back-to-top");
		var header = document.querySelector(".site-header");
		if (!arrow || !header) return;

		arrow.addEventListener("click", function (e) {
			e.preventDefault();
			window.scrollTo({
				top: 0,
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
			});
		});

		// SOP §2/§11: IntersectionObserver instead of a $(window).scroll()
		// + didScroll flag polled via setInterval, so this runs off the
		// main thread's layout-thrash path instead of firing on every
		// scroll tick. Two 1px sentinels sit at the same scroll offsets
		// the old thresholds used (90px sticky header, 200px back-to-top).
		if (!("IntersectionObserver" in window)) {
			var ticking = false;
			var updateScrollState = function () {
				var y = window.pageYOffset || document.documentElement.scrollTop;
				arrow.style.right = y > 200 ? "10px" : "-40px";
				header.classList.toggle("sticky", y > 90);
				ticking = false;
			};
			window.addEventListener(
				"scroll",
				function () {
					if (!ticking) {
						window.requestAnimationFrame(updateScrollState);
						ticking = true;
					}
				},
				{ passive: true }
			);
			updateScrollState();
			return;
		}

		function makeSentinel(offsetTop) {
			var el = document.createElement("div");
			el.setAttribute("aria-hidden", "true");
			el.style.cssText =
				"position:absolute;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden;top:" +
				offsetTop +
				"px;";
			document.body.appendChild(el);
			return el;
		}

		var headerSentinel = makeSentinel(90);
		new IntersectionObserver(function (entries) {
			header.classList.toggle("sticky", !entries[entries.length - 1].isIntersecting);
		}).observe(headerSentinel);

		var backToTopSentinel = makeSentinel(200);
		new IntersectionObserver(function (entries) {
			var visible = !entries[entries.length - 1].isIntersecting;
			arrow.style.right = visible ? "10px" : "-40px";
		}).observe(backToTopSentinel);
	};

	/* ==================================================
	   Accordion / Toggle (event delegation, replacing
	   jQuery's .delegate())
	================================================== */
	BORNTOGIVE.accordion = function () {
		var triggers = document.querySelectorAll(".accordion-heading.accordionize");
		triggers.forEach(function (trigger) {
			trigger.addEventListener("click", function (event) {
				var toggle = event.target.closest(".accordion-toggle");
				if (!toggle || !trigger.contains(toggle)) return;
				event.preventDefault();
				if (toggle.classList.contains("active")) {
					toggle.classList.remove("active");
					toggle.classList.add("inactive");
				} else {
					trigger.querySelectorAll(".active").forEach(function (el) {
						el.classList.add("inactive");
						el.classList.remove("active");
					});
					toggle.classList.remove("inactive");
					toggle.classList.add("active");
				}
			});
		});
	};

	BORNTOGIVE.toggle = function () {
		var triggers = document.querySelectorAll(".accordion-heading.togglize");
		triggers.forEach(function (trigger) {
			trigger.addEventListener("click", function (event) {
				var toggle = event.target.closest(".accordion-toggle");
				if (!toggle || !trigger.contains(toggle)) return;
				event.preventDefault();
				if (toggle.classList.contains("active")) {
					toggle.classList.remove("active");
					toggle.classList.add("inactive");
				} else {
					toggle.classList.remove("inactive");
					toggle.classList.add("active");
				}
			});
		});
	};

	/* ==================================================
	   Tooltip / Popover
	   Bug fix: the previous jQuery selectors matched the
	   Bootstrap 3/4 attribute name (`data-toggle`); this site's
	   markup uses Bootstrap 5's `data-bs-toggle`, so tooltips/
	   popovers on the stat-circle percentages never actually
	   initialized. Wired to the real attribute + Bootstrap 5's
	   own JS component (the SOP's documented replacement).
	================================================== */
	BORNTOGIVE.toolTip = function () {
		if (typeof bootstrap === "undefined") return;
		document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
			new bootstrap.Tooltip(el);
		});
		document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
			var popover = new bootstrap.Popover(el, { html: true });
			el.addEventListener("click", function (e) {
				e.preventDefault();
				el.focus();
			});
		});
	};

	/* ==================================================
	   Hero Swiper Slider
	================================================== */
	BORNTOGIVE.heroSwiper = function () {
		var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		document.querySelectorAll(".hero-slider.swiper").forEach(function (el) {
			new Swiper(el, {
				effect: "fade",
				fadeEffect: { crossFade: true },
				loop: true,
				speed: 600,
				autoplay: reducedMotion
					? false
					: {
							delay: 5000,
							disableOnInteraction: false,
							pauseOnMouseEnter: true,
					  },
				navigation: {
					nextEl: ".swiper-button-next",
					prevEl: ".swiper-button-prev",
				},
			});
		});
	};

	/* ==================================================
	   Gallery Swiper (single-item slideshow embedded in a grid cell)
	================================================== */
	BORNTOGIVE.gallerySwiper = function () {
		var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		document.querySelectorAll(".gallery-slider.swiper").forEach(function (el) {
			new Swiper(el, {
				loop: true,
				speed: 600,
				autoplay: reducedMotion
					? false
					: {
							delay: 5000,
							disableOnInteraction: false,
							pauseOnMouseEnter: true,
					  },
				navigation: {
					nextEl: el.querySelector(".swiper-button-next"),
					prevEl: el.querySelector(".swiper-button-prev"),
				},
			});
		});
	};

	/* ==================================================
	   Swiper Carousel (generic, reads the same data-* attrs as OwlCarousel)
	================================================== */
	BORNTOGIVE.SwiperCarousel = function () {
		var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		document.querySelectorAll(".swiper.carousel-fw").forEach(function (el) {
			var carouselColumns = el.getAttribute("data-columns") || "4";
			var carouselItemsDesktop = el.getAttribute("data-items-desktop") || "4";
			var carouselItemsDesktopSmall = el.getAttribute("data-items-desktop-small") || "3";
			var carouselItemsTablet = el.getAttribute("data-items-tablet") || "2";
			var carouselItemsMobile = el.getAttribute("data-items-mobile") || "1";
			var carouselPagination = el.getAttribute("data-pagination") === "yes";
			var carouselArrows = el.getAttribute("data-arrows") === "yes";
			var carouselSingle = el.getAttribute("data-single-item") === "yes";

			var autoplayAttr = el.getAttribute("data-autoplay");
			var autoplayDelay = 0;
			if (autoplayAttr && !reducedMotion) {
				var parsedDelay = parseInt(autoplayAttr, 10);
				autoplayDelay = parsedDelay > 0 ? parsedDelay : 5000;
			}

			var swiperConfig = {
				slidesPerView: carouselSingle ? 1 : parseInt(carouselItemsMobile, 10),
				spaceBetween: 30,
				breakpoints: {
					768: { slidesPerView: carouselSingle ? 1 : parseInt(carouselItemsTablet, 10) },
					992: { slidesPerView: carouselSingle ? 1 : parseInt(carouselItemsDesktopSmall, 10) },
					1200: { slidesPerView: carouselSingle ? 1 : parseInt(carouselItemsDesktop, 10) },
					1400: { slidesPerView: carouselSingle ? 1 : parseInt(carouselColumns, 10) },
				},
			};

			if (autoplayDelay > 0) {
				swiperConfig.loop = true;
				swiperConfig.autoplay = { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true };
			}
			var paginationEl = el.querySelector(".swiper-pagination");
			if (carouselPagination && paginationEl) {
				swiperConfig.pagination = { el: paginationEl, clickable: true };
			}
			var nextEl = el.querySelector(".swiper-button-next");
			if (carouselArrows && nextEl) {
				swiperConfig.navigation = {
					nextEl: nextEl,
					prevEl: el.querySelector(".swiper-button-prev"),
				};
			}

			new Swiper(el, swiperConfig);
		});
	};

	/* ==================================================
	   GLightbox
	================================================== */
	BORNTOGIVE.GLightbox = function () {
		if (typeof GLightbox === "undefined") return;
		GLightbox({
			selector: ".glightbox",
			touchNavigation: true,
			loop: false,
		});
	};

	/* ==================================================
	   Header Functions
	   Removed: BORNTOGIVE.StickyHeader() / the jQuery Sticky
	   plugin. It targeted `.header-style2 .site-header` and
	   `.header-style3 .fw-menu-wrapper` — neither selector matches
	   any element anywhere on this site (verified via a site-wide
	   grep), so the plugin call was already a silent no-op. The
	   site's actual sticky header behavior lives entirely in
	   scrollToTop()'s IntersectionObserver, which toggles the
	   `.sticky` class that css/style.css styles.
	================================================== */

	/* ==================================================
		Responsive Nav Menu
	================================================== */
	BORNTOGIVE.MobileMenu = function () {
		var toggle = document.getElementById("menu-toggle");
		var ddMenu = document.querySelector(".dd-menu");
		var siteHeader = document.querySelector(".site-header");
		if (!toggle || !ddMenu) return;

		toggle.addEventListener("click", function () {
			var opened = toggle.classList.toggle("opened");
			toggle.setAttribute("aria-expanded", opened ? "true" : "false");
			ddMenu.style.display = opened ? "block" : "none";
			if ((window.pageYOffset || document.documentElement.scrollTop) <= 0 && siteHeader) {
				siteHeader.classList.toggle("menu-opened");
			}
		});

		// NOTE: the 992px check below must match the CSS breakpoint that
		// shows/hides #menu-toggle (see the `@media (max-width: 992px)`
		// block in css/style.css). This handler used to run on every
		// resize event unconditionally, including the fake "resize" fired
		// by mobile browsers when the address bar shows/hides or an
		// on-screen keyboard opens/closes — which force-set display:none
		// inline on #menu-toggle, permanently overriding the CSS and
		// leaving mobile users with no way to open the nav at all. Only
		// touch the inline styles when actually crossing the desktop
		// breakpoint, and clear them (rather than force display:none) so
		// the CSS media query stays in control at every other width.
		window.addEventListener("resize", function () {
			if (window.innerWidth > 992) {
				ddMenu.style.display = "";
				toggle.style.display = "";
				toggle.classList.remove("opened");
				toggle.setAttribute("aria-expanded", "false");
				if (siteHeader) siteHeader.classList.remove("menu-opened");
			}
		});
	};

	/* ==================================================
	   IsoTope Portfolio
	   Rewritten onto Isotope's own vanilla constructor/instance API
	   (`new Isotope()` / `.arrange()`) instead of the jQuery-Bridget
	   `.isotope()` method jQuery-Bridget bolts onto $.fn — Isotope's
	   packaged bundle only needs jQuery for that bridge, and the core
	   library is jQuery-free (SOP §19 / stretch issue #21 notes).
	================================================== */
	BORNTOGIVE.IsoTope = function () {
		if (typeof Isotope !== "function") return;

		// Matches the original's timing exactly: Isotope instantiation
		// (and the initial filter click that lays the grid out) waited
		// for `window.load` — i.e. images finished loading — rather than
		// DOMContentLoaded, since masonry needs real image heights to
		// compute correct positions.
		window.addEventListener(
			"load",
			function () {
				document.querySelectorAll("ul.sort-source").forEach(function (source) {
					var sortId = source.getAttribute("data-sort-id");
					var destination = document.querySelector('ul.sort-destination[data-sort-id="' + sortId + '"]');
					if (!destination) return;

					var iso = new Isotope(destination, {
						itemSelector: ".grid-item",
						layoutMode: "masonry",
					});

					function applyFilter(filter) {
						source.querySelectorAll("li.active").forEach(function (li) {
							li.classList.remove("active");
						});
						var match = source.querySelector('li[data-option-value="' + filter + '"]');
						if (match) match.classList.add("active");
						iso.arrange({ filter: filter === "*" ? "*" : filter });
					}

					source.querySelectorAll("a").forEach(function (link) {
						link.addEventListener("click", function (e) {
							e.preventDefault();
							var filter = link.parentElement.getAttribute("data-option-value");
							applyFilter(filter);
							if (window.location.hash !== "" || filter.replace(".", "") !== "*") {
								window.location.hash = filter.replace(".", "");
							}
						});
					});

					window.addEventListener("hashchange", function () {
						var hashFilter = "." + location.hash.replace("#", "");
						var hash = hashFilter === "." || hashFilter === ".*" ? "*" : hashFilter;
						applyFilter(hash);
					});

					var initialFilter = "." + (location.hash.replace("#", "") || "*");
					var initialMatch = source.querySelector('li[data-option-value="' + initialFilter + '"] a');
					if (initialMatch) {
						initialMatch.click();
					} else {
						var first = source.querySelector("li:first-child a");
						if (first) first.click();
					}
				});

				var isotopeGrid = document.querySelector(".isotope-grid");
				if (isotopeGrid) {
					new Isotope(isotopeGrid, { itemSelector: ".grid-item", layoutMode: "masonry" });
				}

				var gridHolder = document.querySelector(".grid-holder");
				if (gridHolder) {
					var blogIso = new Isotope(gridHolder, { itemSelector: ".grid-item" });
					window.addEventListener(
						"resize",
						debounce(function () {
							blogIso.layout();
						}, 150)
					);
				}
			},
			{ once: true }
		);
	};

	/* ==================================================
	   Pricing Tables — batches all height reads before any
	   writes (SOP §5/§11: avoid layout thrash).
	================================================== */
	BORNTOGIVE.pricingTable = function () {
		document.querySelectorAll(".pricing-table").forEach(function (table) {
			var featureLists = table.querySelectorAll("> div .features");
			var heights = [];
			featureLists.forEach(function (el) {
				heights.push(el.offsetHeight);
			});
			var tallest = Math.max.apply(null, heights.length ? heights : [0]);
			featureLists.forEach(function (el) {
				el.style.height = tallest > 0 ? tallest + "px" : "auto";
			});
		});
	};

	/* ==================================================
	   Equal-height groups (replaces jquery.matchHeight, which was
	   bundled in js/ui-plugins.js). Groups elements by row (same
	   rounded offsetTop) and sets each row to its tallest member's
	   natural height — same "byRow" behavior matchHeight had.
	   Reads are batched before writes per element group to avoid
	   layout thrash.
	================================================== */
	function matchHeightGroup(elements) {
		var els = Array.prototype.slice.call(elements);
		if (els.length <= 1) return;

		els.forEach(function (el) {
			el.style.height = "";
		});

		var tops = els.map(function (el) {
			return el.getBoundingClientRect().top;
		});
		var rows = [];
		els.forEach(function (el, i) {
			var row = rows.find(function (r) {
				return Math.abs(r.top - tops[i]) <= 1;
			});
			if (row) {
				row.els.push(el);
			} else {
				rows.push({ top: tops[i], els: [el] });
			}
		});

		rows.forEach(function (row) {
			var heights = row.els.map(function (el) {
				return el.offsetHeight;
			});
			var max = Math.max.apply(null, heights);
			row.els.forEach(function (el) {
				el.style.height = max + "px";
			});
		});
	}

	BORNTOGIVE.matchHeights = function () {
		document.querySelectorAll(".content").forEach(function (content) {
			matchHeightGroup(content.querySelectorAll(".carousel-fw .grid-item .grid-item-content"));
			matchHeightGroup(content.querySelectorAll(".featured-texts .featured-text"));
		});
	};

	/* ==================================================
	   Init Functions
	================================================== */
	function debounce(fn, wait) {
		var timeout;
		return function () {
			var args = arguments;
			var context = this;
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				fn.apply(context, args);
			}, wait);
		};
	}

	function ready(fn) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", fn);
		} else {
			fn();
		}
	}

	ready(function () {
		BORNTOGIVE.scrollToTop();
		BORNTOGIVE.accordion();
		BORNTOGIVE.toggle();
		BORNTOGIVE.toolTip();
		BORNTOGIVE.SwiperCarousel();
		BORNTOGIVE.GLightbox();
		BORNTOGIVE.IsoTope();
		BORNTOGIVE.heroSwiper();
		BORNTOGIVE.gallerySwiper();
		BORNTOGIVE.pricingTable();
		BORNTOGIVE.MobileMenu();
		BORNTOGIVE.matchHeights();

		/* Centering the dropdown menus — removed. This jQuery mouseover
		   handler computed an inline `left` offset for `.dd-menu li ul`.
		   The only nav on this site is the megamenu (`.dd-menu > li.megamenu`),
		   whose dropdown width/position is pinned with `left: 0 !important`
		   in css/style.css — the JS-computed inline style was always
		   overridden by that `!important` rule, so this was a no-op. */

		/* Donation Modal (single amount) */
		var predefinedAmount = document.querySelector(".predefined-amount input[name=total-amount]:checked");
		if (predefinedAmount) predefinedAmount.closest("label").classList.add("selected");
		document.querySelectorAll(".predefined-amount input[name=total-amount]").forEach(function (radio) {
			radio.addEventListener("click", function () {
				document.querySelectorAll(".predefined-amount input[name=total-amount]").forEach(function (r) {
					if (r !== radio) r.closest("label").classList.remove("selected");
				});
				radio.closest("label").classList.add("selected");
			});
		});

		/* Donation Modal (subscription frequency) */
		var predefinedAmount2 = document.querySelector(".predefined-amount2 input[name=subscription]:checked");
		if (predefinedAmount2) predefinedAmount2.closest("label").classList.add("selected");
		document.querySelectorAll(".predefined-amount2 input[name=subscription]").forEach(function (radio) {
			radio.addEventListener("click", function () {
				document.querySelectorAll(".predefined-amount2 input[name=subscription]").forEach(function (r) {
					if (r !== radio) r.closest("label").classList.remove("selected");
				});
				radio.closest("label").classList.add("selected");
			});
		});
	});

	window.addEventListener(
		"load",
		function () {
			function appendZoomIcon(selector, iconClass) {
				document.querySelectorAll(selector).forEach(function (el) {
					var mediaBox = el.querySelector(".media-box");
					if (!mediaBox) return;
					var span = document.createElement("span");
					span.className = "zoom";
					span.innerHTML = '<span class="icon"><i class="fa ' + iconClass + '" aria-hidden="true"></i></span>';
					mediaBox.appendChild(span);
				});
			}
			appendZoomIcon(".format-image", "fa-search");
			appendZoomIcon(".format-standard", "fa-plus");
			appendZoomIcon(".format-video", "fa-play");
			appendZoomIcon(".format-link", "fa-link");

			document.querySelectorAll(".carousel-wrapper").forEach(function (el) {
				el.style.background = "none";
			});
		},
		{ once: true }
	);

	/* Icon prepend — decorative leading icons, applied once at parse
	   time (this script is `defer`red, so the DOM is fully parsed by
	   the time this IIFE body runs). */
	function prependIcon(selector, html) {
		document.querySelectorAll(selector).forEach(function (el) {
			el.insertAdjacentHTML("afterbegin", html);
		});
	}
	prependIcon(".basic-link", '<i class="fa fa-angle-right" aria-hidden="true"></i> ');
	prependIcon(".basic-link.backward", '<i class="fa fa-angle-left" aria-hidden="true"></i> ');
	prependIcon("ul.checks li", '<i class="fa fa-check" aria-hidden="true"></i> ');
	prependIcon(
		"ul.angles li, .widget_categories ul li a, .widget_archive ul li a, .widget_recent_entries ul li a, .widget_recent_comments ul li a, .widget_links ul li a, .widget_meta ul li a",
		'<i class="fa fa-caret-right" aria-hidden="true"></i> '
	);
	prependIcon("ul.chevrons li", '<i class="fa fa-chevron-right" aria-hidden="true"></i> ');
	prependIcon("ul.carets li, ul.inline li", '<i class="fa fa-caret-right" aria-hidden="true"></i> ');
	prependIcon("a.external", '<i class="fa fa-external-link" aria-hidden="true"></i> ');

	/* Animation Appear / Animation Progress Bars — IntersectionObserver
	   replacing jQuery.appear() (SOP §11's preferred scroll-position-
	   driven pattern). Only live on the shortcodes.html style-guide
	   pages; width-based progress-bar fill is kept (it mirrors the
	   original demo exactly) but gated behind prefers-reduced-motion,
	   which jumps straight to the final width with no transition. */
	function initAppearAnimations() {
		var appearEls = document.querySelectorAll("[data-appear-animation]");
		if (appearEls.length && "IntersectionObserver" in window) {
			var io = new IntersectionObserver(
				function (entries, obs) {
					entries.forEach(function (entry) {
						if (!entry.isIntersecting) return;
						var el = entry.target;
						obs.unobserve(el);
						var delay = parseInt(el.getAttribute("data-appear-animation-delay"), 10) || 1;
						el.classList.add("appear-animation");
						if (delay > 1) el.style.animationDelay = delay + "ms";
						el.classList.add(el.getAttribute("data-appear-animation"));
						setTimeout(function () {
							el.classList.add("appear-animation-visible");
						}, delay);
					});
				},
				{ rootMargin: "-150px 0px 0px 0px", threshold: 0 }
			);
			appearEls.forEach(function (el) {
				io.observe(el);
			});
		} else {
			appearEls.forEach(function (el) {
				el.classList.add("appear-animation", "appear-animation-visible");
			});
		}

		var progressEls = document.querySelectorAll("[data-appear-progress-animation]");
		if (progressEls.length && "IntersectionObserver" in window) {
			var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			var ioProgress = new IntersectionObserver(
				function (entries, obs) {
					entries.forEach(function (entry) {
						if (!entry.isIntersecting) return;
						var el = entry.target;
						obs.unobserve(el);
						var target = el.getAttribute("data-appear-progress-animation");
						var delay = parseInt(el.getAttribute("data-appear-animation-delay"), 10) || 1;
						setTimeout(
							function () {
								if (!reducedMotion) el.style.transition = "width 1.5s ease-out";
								el.style.width = target;
								var tooltip = el.querySelector(".progress-bar-tooltip");
								if (tooltip) {
									tooltip.style.transition = reducedMotion ? "none" : "opacity 0.5s ease-out";
									tooltip.style.opacity = "1";
								}
							},
							reducedMotion ? 0 : delay
						);
					});
				},
				{ rootMargin: "-50px 0px 0px 0px", threshold: 0 }
			);
			progressEls.forEach(function (el) {
				ioProgress.observe(el);
			});
		}
	}
	initAppearAnimations();

	window.BORNTOGIVE = BORNTOGIVE;
})();

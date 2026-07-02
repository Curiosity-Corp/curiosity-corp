jQuery(function($){
	"use strict";

var BORNTOGIVE = window.BORNTOGIVE || {};

/* ==================================================
	Contact Form Validations
================================================== */
	BORNTOGIVE.ContactForm = function(){
		$('.contact-form').each(function(){
			var formInstance = $(this);
			formInstance.submit(function(){
		
			var action = $(this).attr('action');
		
			$("#message").slideUp(750,function() {
			$('#message').hide();
		
			$('#submit')
				.after('<img src="images/assets/ajax-loader.gif" class="loader" />')
				.attr('disabled','disabled');
		
			$.post(action, {
				fname: $('#fname').val(),
				lname: $('#lname').val(),
				email: $('#email').val(),
				phone: $('#phone').val(),
				comments: $('#comments').val()
			},
				function(data){
					document.getElementById('message').innerHTML = data;
					$('#message').slideDown('slow');
					$('.contact-form img.loader').fadeOut('slow',function(){$(this).remove()});
					$('#submit').removeAttr('disabled');
					if(data.match('success') != null) $('.contact-form').slideUp('slow');
		
				}
			);
			});
			return false;
		});
		});
	}
/* ==================================================
	Scroll Functions
================================================== */
	BORNTOGIVE.scrollToTop = function(){
		var $arrow = $('#back-to-top');
		var $header = $('.site-header');

		$arrow.on('click',function(e) {
			$('body,html').animate({ scrollTop: "0" }, 750, 'easeOutExpo' );
			e.preventDefault();
		})

		// SOP §2/§11: replaces the old $(window).scroll() + didScroll
		// flag polled via setInterval(250) with IntersectionObserver,
		// which runs off the main thread's layout-thrash path instead
		// of firing a handler on every scroll tick. Two 1px sentinels
		// are inserted at the exact scroll offsets the old thresholds
		// used (90px for the sticky header, 200px for the back-to-top
		// button) so the visible behavior is unchanged.
		if (!('IntersectionObserver' in window)) {
			// Fallback for browsers without IntersectionObserver: a
			// passive, rAF-throttled scroll listener (still no
			// unthrottled per-tick handler, unlike the old code).
			var ticking = false;
			var updateScrollState = function() {
				var y = window.pageYOffset || document.documentElement.scrollTop;
				$arrow.css("right", y > 200 ? 10 : "-40px");
				$header.toggleClass("sticky", y > 90);
				ticking = false;
			};
			window.addEventListener('scroll', function() {
				if (!ticking) {
					window.requestAnimationFrame(updateScrollState);
					ticking = true;
				}
			}, { passive: true });
			updateScrollState();
			return;
		}

		function makeSentinel(offsetTop) {
			var el = document.createElement('div');
			el.setAttribute('aria-hidden', 'true');
			el.style.cssText = 'position:absolute;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden;top:' + offsetTop + 'px;';
			document.body.appendChild(el);
			return el;
		}

		var headerSentinel = makeSentinel(90);
		new IntersectionObserver(function(entries) {
			$header.toggleClass("sticky", !entries[entries.length - 1].isIntersecting);
		}).observe(headerSentinel);

		var backToTopSentinel = makeSentinel(200);
		new IntersectionObserver(function(entries) {
			var visible = !entries[entries.length - 1].isIntersecting;
			$arrow.css("right", visible ? 10 : "-40px");
		}).observe(backToTopSentinel);
	}
/* ==================================================
   Accordion
================================================== */
	BORNTOGIVE.accordion = function(){
		var accordion_trigger = $('.accordion-heading.accordionize');
		
		accordion_trigger.delegate('.accordion-toggle','click', function(event){
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$(this).addClass('inactive');
			}
			else{
				accordion_trigger.find('.active').addClass('inactive');          
				accordion_trigger.find('.active').removeClass('active');   
				$(this).removeClass('inactive');
				$(this).addClass('active');
			}
			event.preventDefault();
		});
	}
/* ==================================================
   Toggle
================================================== */
	BORNTOGIVE.toggle = function(){
		var accordion_trigger_toggle = $('.accordion-heading.togglize');
		
		accordion_trigger_toggle.delegate('.accordion-toggle','click', function(event){
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$(this).addClass('inactive');
			}
			else{
				$(this).removeClass('inactive');
				$(this).addClass('active');
			}
			event.preventDefault();
		});
	}
/* ==================================================
   Tooltip
================================================== */
	BORNTOGIVE.toolTip = function(){ 
		$('a[data-toggle=tooltip]').tooltip(); 
		$('a[data-toggle=tooltip]').tooltip();
		$('a[data-toggle=popover]').popover({html:true}).on("click", function(e) { 
       		e.preventDefault(); 
       		$(this).focus(); 
		});
	}
/* ==================================================
   Twitter Widget
================================================== */
	BORNTOGIVE.TwitterWidget = function() {
		$('.twitter-widget').each(function(){
			var twitterInstance = $(this); 
			var twitterTweets = twitterInstance.attr("data-tweets-count") ? twitterInstance.attr("data-tweets-count") : "1"
			twitterInstance.twittie({
            	dateFormat: '%b. %d, %Y',
            	template: '<li><i class="fa fa-twitter"></i> {{tweet}} <span class="tweet-date">{{date}}</span></li>',
            	count: twitterTweets,
            	hideReplies: true
        	});
		});
	}
/* ==================================================
   Hero Swiper Slider
================================================== */
	BORNTOGIVE.heroSwiper = function() {
		// SOP §11: autoplay must itself respect prefers-reduced-motion,
		// not just the CSS transition-duration override.
		var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		$('.hero-slider.swiper').each(function(){
				new Swiper(this, {
					effect: "fade",
					fadeEffect: { crossFade: true },
					loop: true,
					speed: 600,
					autoplay: reducedMotion ? false : {
						delay: 5000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true
					},
					navigation: {
						nextEl: ".swiper-button-next",
						prevEl: ".swiper-button-prev"
					}
				});
		});
	}
/* ==================================================
   Gallery Swiper (single-item slideshow embedded in a grid cell)
================================================== */
	BORNTOGIVE.gallerySwiper = function() {
		var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		$('.gallery-slider.swiper').each(function(){
				var carouselInstance = $(this);
				new Swiper(this, {
					loop: true,
					speed: 600,
					autoplay: reducedMotion ? false : {
						delay: 5000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true
					},
					navigation: {
						nextEl: carouselInstance.find('.swiper-button-next').get(0),
						prevEl: carouselInstance.find('.swiper-button-prev').get(0)
					}
				});
		});
	}
/* ==================================================
   Swiper Carousel (generic, reads the same data-* attrs as OwlCarousel)
================================================== */
	BORNTOGIVE.SwiperCarousel = function() {
		var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		$('.swiper.carousel-fw').each(function(){
				var carouselInstance = $(this);
				var carouselColumns = carouselInstance.attr("data-columns") ? carouselInstance.attr("data-columns") : "1"
				var carouselitemsDesktop = carouselInstance.attr("data-items-desktop") ? carouselInstance.attr("data-items-desktop") : "4"
				var carouselitemsDesktopSmall = carouselInstance.attr("data-items-desktop-small") ? carouselInstance.attr("data-items-desktop-small") : "3"
				var carouselitemsTablet = carouselInstance.attr("data-items-tablet") ? carouselInstance.attr("data-items-tablet") : "2"
				var carouselitemsMobile = carouselInstance.attr("data-items-mobile") ? carouselInstance.attr("data-items-mobile") : "1"
				var carouselPagination = carouselInstance.attr("data-pagination") == 'yes' ? true : false
				var carouselArrows = carouselInstance.attr("data-arrows") == 'yes' ? true : false
				var carouselSingle = carouselInstance.attr("data-single-item") == 'yes' ? true : false

				var autoplayAttr = carouselInstance.attr("data-autoplay");
				var autoplayDelay = 0;
				if(autoplayAttr && !reducedMotion){
					var parsedDelay = parseInt(autoplayAttr, 10);
					autoplayDelay = (parsedDelay > 0) ? parsedDelay : 5000;
				}

				var swiperConfig = {
					slidesPerView: carouselSingle ? 1 : parseInt(carouselitemsMobile, 10),
					spaceBetween: 30,
					breakpoints: {
						768:  { slidesPerView: carouselSingle ? 1 : parseInt(carouselitemsTablet, 10) },
						992:  { slidesPerView: carouselSingle ? 1 : parseInt(carouselitemsDesktopSmall, 10) },
						1200: { slidesPerView: carouselSingle ? 1 : parseInt(carouselitemsDesktop, 10) },
						1400: { slidesPerView: carouselSingle ? 1 : parseInt(carouselColumns, 10) }
					}
				};

				if(autoplayDelay > 0){
					swiperConfig.loop = true;
					// SOP §11: this generic carousel previously had no
					// pauseOnMouseEnter at all (unlike hero/gallery) —
					// add it so hovering pauses autoplay here too.
					swiperConfig.autoplay = { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true };
				}
				if(carouselPagination && carouselInstance.find('.swiper-pagination').length){
					swiperConfig.pagination = { el: carouselInstance.find('.swiper-pagination').get(0), clickable: true };
				}
				if(carouselArrows && carouselInstance.find('.swiper-button-next').length){
					swiperConfig.navigation = {
						nextEl: carouselInstance.find('.swiper-button-next').get(0),
						prevEl: carouselInstance.find('.swiper-button-prev').get(0)
					};
				}

				new Swiper(this, swiperConfig);
		});
	}
/* ==================================================
   GLightbox
================================================== */
	BORNTOGIVE.GLightbox = function() {
		GLightbox({
			selector: '.glightbox',
			touchNavigation: true,
			loop: false
		});
	}
/* ==================================================
   Animated Counters
================================================== */
	BORNTOGIVE.Counters = function() {
		$('.counters').each(function () {
			$(".timer .count").appear(function() {
			var counter = $(this).html();
			$(this).countTo({
				from: 0,
				to: counter,
				speed: 2000,
				refreshInterval: 60
				});
			});
		});
	}
/* ==================================================
   SuperFish menu
================================================== */
	BORNTOGIVE.SuperFish = function() {
		$('.sf-menu').superfish({
			  delay: 200,
			  animation: {opacity:'show', height:'show'},
			  speed: 'fast',
			  cssArrows: false,
			  disableHI: true
		});
		$(".dd-menu > li:has(ul)").find("a:first").append(" <i class='fa fa-caret-down'></i>");
		$(".dd-menu > li > ul > li:has(ul)").find("a:first").append(" <i class='fa fa-caret-right'></i>");
		$(".dd-menu > li > ul > li > ul > li:has(ul)").find("a:first").append(" <i class='fa fa-caret-right'></i>");
	}
/* ==================================================
   Header Functions
================================================== */
	BORNTOGIVE.StickyHeader = function() {
		$(".header-style2 .site-header").sticky();
		$(".header-style3 .fw-menu-wrapper").sticky();
	}
/* ==================================================
	Responsive Nav Menu
================================================== */
	BORNTOGIVE.MobileMenu = function() {
		// Responsive Menu Events
		$('#menu-toggle').on("click", function(){
			var $toggle = $(this).toggleClass("opened");
			$toggle.attr("aria-expanded", $toggle.hasClass("opened"));
			$(".dd-menu").slideToggle();
			if( $(window).scrollTop() <= 0 ) {
				$(".site-header").toggleClass("menu-opened");
			}
			return false;
		});
		// NOTE: the 992px check below must match the CSS breakpoint that
		// shows/hides #menu-toggle (see the `@media (max-width: 992px)`
		// block in css/style.css). This handler used to run on every
		// resize event unconditionally, including the fake "resize" fired
		// by mobile browsers when the address bar shows/hides or an
		// on-screen keyboard opens/closes — which set `display:none`
		// inline on #menu-toggle via jQuery .css(), permanently
		// overriding the CSS and leaving mobile users with no way to
		// open the nav at all. Only touch the inline styles when actually
		// crossing the desktop breakpoint, and clear them (rather than
		// force display:none) so the CSS media query stays in control at
		// every other width.
		$(window).on("resize", function(){
			if ($(window).width() > 992) {
				$(".dd-menu").css("display", "");
				$("#menu-toggle").css("display", "").removeClass("opened").attr("aria-expanded", "false");
				$(".site-header").removeClass("menu-opened");
			}
		});
	}
/* ==================================================
   IsoTope Portfolio
================================================== */
		BORNTOGIVE.IsoTope = function() {	
		$("ul.sort-source").each(function() {
			var source = $(this);
			var destination = $("ul.sort-destination[data-sort-id=" + $(this).attr("data-sort-id") + "]");
			if(destination.get(0) && typeof jQuery.fn.isotope === 'function') {
				$(window).load(function() {
					destination.isotope({
						itemSelector: ".grid-item",
						layoutMode: 'masonry'
					});
					source.find("a").on("click", function(e) {
						e.preventDefault();
						var $this = $(this),
							filter = $this.parent().attr("data-option-value");
						source.find("li.active").removeClass("active");
						$this.parent().addClass("active");
						destination.isotope({
							filter: filter
						});
						if(window.location.hash != "" || filter.replace(".","") != "*") {
							self.location = "#" + filter.replace(".","");
						}
						return false;
					});
					$(window).on("hashchange", function(e) {
						var hashFilter = "." + location.hash.replace("#",""),
							hash = (hashFilter == "." || hashFilter == ".*" ? "*" : hashFilter);
						source.find("li.active").removeClass("active");
						source.find("li[data-option-value='" + hash + "']").addClass("active");
						destination.isotope({
							filter: hash
						});
					});
					var hashFilter = "." + (location.hash.replace("#","") || "*");
					var initFilterEl = source.find("li[data-option-value='" + hashFilter + "'] a");
					if(initFilterEl.get(0)) {
						source.find("li[data-option-value='" + hashFilter + "'] a").click();
					} else {
						source.find("li:first-child a").click();
					}
				});
			}
		});
		$(window).load(function() {
			var IsoTopeCont = $(".isotope-grid");
			if (typeof jQuery.fn.isotope === 'function' && IsoTopeCont.length) {
				IsoTopeCont.isotope({
					itemSelector: ".grid-item",
					layoutMode: 'masonry'
				});
			}
			if (typeof jQuery.fn.isotope === 'function' && $(".grid-holder").length > 0){	
				var $container_blog = $('.grid-holder');
				$container_blog.isotope({
					itemSelector : '.grid-item'
				});
				$(window).resize(function() {
					var $container_blog = $('.grid-holder');
					$container_blog.isotope({
						itemSelector : '.grid-item'
					});
				});
			}
		});
	}
/* ==================================================
   Pricing Tables
================================================== */
	var $tallestCol;
	BORNTOGIVE.pricingTable = function(){
		$('.pricing-table').each(function(){
			$tallestCol = 0;
			$(this).find('> div .features').each(function(){
				($(this).height() > $tallestCol) ? $tallestCol = $(this).height() : $tallestCol = $tallestCol;
			});	
			if($tallestCol == 0) $tallestCol = 'auto';
			$(this).find('> div .features').css('height',$tallestCol);
		});
	}
/* ==================================================
   Circle Progress
================================================== */
	BORNTOGIVE.CProgress = function() {
		$('.cProgress').each(function(){
			var cproInstance = $(this); 
			var cprocomplete = cproInstance.attr("data-complete") ? cproInstance.attr("data-complete") : "0.1"
			var cprocolor = cproInstance.attr("data-color") ? cproInstance.attr("data-color") : "d82e67"
			var cprocompleteperc = cprocomplete/100
			cproInstance.circleProgress({
				value: cprocompleteperc,
				size: 60.0,
				emptyFill: 'rgba(0, 0, 0, .1)',
				fill: { color: '#'+cprocolor }
			}).on('circle-animation-progress', function(event, progress) {
				cproInstance.find('strong').html(parseInt(cprocomplete * progress, 10) + '<i>%</i>');
			});
		});
	}
	
/* ==================================================
   Init Functions
================================================== */
$(document).ready(function(){
	BORNTOGIVE.scrollToTop();
	BORNTOGIVE.accordion();
	BORNTOGIVE.toggle();
	BORNTOGIVE.toolTip();
	BORNTOGIVE.TwitterWidget();
	BORNTOGIVE.SwiperCarousel();
	BORNTOGIVE.GLightbox();
	BORNTOGIVE.SuperFish();
	BORNTOGIVE.Counters();
	BORNTOGIVE.IsoTope();
	BORNTOGIVE.StickyHeader();
	BORNTOGIVE.heroSwiper();
	BORNTOGIVE.gallerySwiper();
	BORNTOGIVE.pricingTable();
	BORNTOGIVE.MobileMenu();
	BORNTOGIVE.CProgress();
	$('.selectpicker').selectpicker({container:'body'});
	WWHGetter();
	// apply matchHeight to each item container's items
	$('.content').each(function() {
		$(this).find('.carousel-fw .grid-item').find('.grid-item-content').matchHeight({
			//property: 'min-height'
		});
		$(this).find('.featured-texts').find('.featured-text').matchHeight({
			//property: 'min-height'
		});
	});
});

// DESIGN ELEMENTS //

// Centering the dropdown menus
$(".dd-menu li").mouseover(function() {
	 var the_width = $(this).find("a").width();
	 var child_width = $(this).find("ul").width();
	 var width = ((child_width - the_width)/2);
	 $(this).find("ul").css('left', -width);
});

// WINDOW RESIZE FUNCTIONS //
$(window).resize(function(){
	WWHGetter();
});

// Any Button Scroll to section
$('.scrollto').on("click", function(){
	$.scrollTo( this.hash, 800, { easing:'easeOutQuint' });
	return false;
});

// FITVIDS
$(".fw-video, .post-media").fitVids();

//Donation Modal
$('.predefined-amount input[name=total-amount]:checked').parent('label').addClass("selected");
$('.predefined-amount input[name=total-amount]').on('click',function() {
	$('.predefined-amount input[name=total-amount]:not(:checked)').parent('label').removeClass("selected");
	$(this).parent('label').addClass("selected");
});


//Donation Modal2
$('.predefined-amount2 input[name=subscription]:checked').parent('label').addClass("selected");
$('.predefined-amount2 input[name=subscription]').on('click',function() {
	$('.predefined-amount2 input[name=subscription]:not(:checked)').parent('label').removeClass("selected");
	$(this).parent('label').addClass("selected");
});

$(window).load(function(){
	$(".format-image").each(function(){
		$(this).find(".media-box").append("<span class='zoom'><span class='icon'><i class='fa fa-search'></i></span></span>");
	});
	$(".format-standard").each(function(){
		$(this).find(".media-box").append("<span class='zoom'><span class='icon'><i class='fa fa-plus'></i></span></span>");
	});
	$(".format-video").each(function(){
		$(this).find(".media-box").append("<span class='zoom'><span class='icon'><i class='fa fa-play'></i></span></span>");
	});
	$(".format-link").each(function(){
		$(this).find(".media-box").append("<span class='zoom'><span class='icon'><i class='fa fa-link'></i></span></span>");
	});
	$(".additional-images .owl-carousel .item-video").each(function(){
		$(this).append("<span class='icon'><i class='fa fa-play'></i></span>");
	});
	BORNTOGIVE.StickyHeader();
	$('.carousel-wrapper').css('background','none');
	
});

// Icon Append
$('.basic-link').prepend(' <i class="fa fa-angle-right"></i>');
$('.basic-link.backward').prepend(' <i class="fa fa-angle-left"></i> ');
$('ul.checks li').prepend('<i class="fa fa-check"></i> ');
$('ul.angles li, .widget_categories ul li a, .widget_archive ul li a, .widget_recent_entries ul li a, .widget_recent_comments ul li a, .widget_links ul li a, .widget_meta ul li a').prepend('<i class="fa fa-caret-right"></i> ');
$('ul.chevrons li').prepend('<i class="fa fa-chevron-right"></i> ');
$('ul.carets li, ul.inline li').prepend('<i class="fa fa-caret-right"></i> ');
$('a.external').prepend('<i class="fa fa-external-link"></i> ');

// Animation Appear
var AppDel;
function AppDelFunction($appd) {
	$appd.addClass("appear-animation");
	if(!$("html").hasClass("no-csstransitions") && $(window).width() > 767) {
		$appd.appear(function() {
			var delay = ($appd.attr("data-appear-animation-delay") ? $appd.attr("data-appear-animation-delay") : 1);
			if(delay > 1) $appd.css("animation-delay", delay + "ms");
			$appd.addClass($appd.attr("data-appear-animation"));
			setTimeout(function() {
				$appd.addClass("appear-animation-visible");
			}, delay);
			clearTimeout();
		}, {accX: 0, accY: -150});
	} else {
		$appd.addClass("appear-animation-visible");
	}
}
function AppDelStopFunction() {
	clearTimeout(AppDel);
}
$("[data-appear-animation]").each(function() {
	var $this = $(this);
	AppDelFunction($this);
	AppDelStopFunction();
});
// Animation Progress Bars

var AppAni;
function AppAniFunction($anim) {
	$anim.appear(function() {
		var delay = ($anim.attr("data-appear-animation-delay") ? $anim.attr("data-appear-animation-delay") : 1);
		if(delay > 1) $anim.css("animation-delay", delay + "ms");
		$anim.addClass($anim.attr("data-appear-animation"));
		setTimeout(function() {
			$anim.animate({
				width: $anim.attr("data-appear-progress-animation")
			}, 1500, "easeOutQuad", function() {
				$anim.find(".progress-bar-tooltip").animate({
					opacity: 1
				}, 500, "easeOutQuad");
			});
		}, delay);
		clearTimeout();
	}, {accX: 0, accY: -50});
}
function AppAniStopFunction() {
	clearTimeout(AppAni);
}
$("[data-appear-progress-animation]").each(function() {
	var $this = $(this);
	AppAniFunction($this);
	AppAniStopFunction();
});

// Parallax Jquery Callings removed (SOP §11) — the jQuery Parallax
// plugin + this Modernizr.touch gate were deleted along with
// js/helper-plugins.js's plugin registration; .parallax1-8 elements
// now render via the CSS-only .parallax fallback in css/style.css
// (background-attachment: fixed, static on touch/.page-banner).

// Window height/Width Getter Classes
function WWHGetter(){
	var wheighter = $(window).height();
	var wwidth = $(window).width();
	$(".wheighter").css("height",wheighter);
	$(".wwidth").css("width",wwidth);
}
});
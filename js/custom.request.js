/* custom.request.js — shared submit handler for the 10 partner
   "Request a Partnership" forms (id="request"): partner/index.html,
   partner/preschool.html, partner/k12.html, partner/homeschool.html,
   partner/higher-education.html, partner/small-business.html,
   partner/ngo.html, partner/igo.html, partner/sme.html,
   impact/mission.html.

   SOP §19 (retire jQuery): replaces js/jquery.validate.js plus the
   per-page inline <script> blocks that called $("#request").validate()
   and $.ajax(). Note on behavior parity: `$("#request").validate()`
   was called with zero rules configured (no `required` classes/
   attributes/`.rules()` calls anywhere in the form markup), so it
   never actually blocked a submission — `.validate().form()` always
   returned true. This rewrite preserves that: no new validation is
   introduced, it only replaces the transport (fetch instead of
   jQuery's $.ajax) and the DOM read/writes (native instead of
   jQuery). jQuery's `.serialize()` produces a URL-encoded query
   string and $.ajax sends it as `application/x-www-form-urlencoded`
   regardless of the form's `enctype` attribute — URLSearchParams +
   fetch reproduces that exact wire format. */
(function () {
	"use strict";

	function init() {
		var form = document.getElementById("request");
		if (!form) return;

		form.addEventListener("submit", function (event) {
			event.preventDefault();

			var postUrl = form.getAttribute("action");
			var method = form.getAttribute("method") || "POST";
			var body = new URLSearchParams(new FormData(form));

			fetch(postUrl, { method: method, body: body })
				.then(function (response) {
					return response.text().then(function (text) {
						return { ok: response.ok, text: text };
					});
				})
				.then(function (result) {
					form.reset();
					document.querySelectorAll('#request input[type="checkbox"]').forEach(function (cb) {
						cb.checked = false;
					});

					var resultsEl = document.getElementById("server-results");
					if (resultsEl) resultsEl.innerHTML = result.text;

					if (typeof Swal !== "undefined") {
						Swal.fire({
							title: "<strong>Request Sent</strong>",
							icon: "success",
							html:
								"Please check your email for a response from us.<br>We also suggest to join the Ignicute Curiosity Community!",
							showCloseButton: true,
							focusConfirm: false,
							confirmButtonText:
								'<a style="color: white" href="../get-involved/success.html"><i class="fa fa-address-card"></i> OK</a>',
							confirmButtonAriaLabel: "Login",
						});
					}
					console.log("Submission was successful.");
					console.log(result.text);
				})
				.catch(function (error) {
					console.log("An error occurred.");
					console.log(error);
				});
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

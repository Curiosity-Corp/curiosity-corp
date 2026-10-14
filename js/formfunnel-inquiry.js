/*
 * Partnership/inquiry forms -> formfunnel (reCAPTCHA v3 gate) -> TLI_Interest.
 *
 * Any <form data-formfunnel="<formType>"> is handled here. The listener runs
 * in the capture phase on document, so it takes the submit before the page's
 * own jQuery handler (which used to post straight to a Logic App URL) and
 * stops it.
 *
 * Contract (tao-ninja/formfunnel): POST application/x-www-form-urlencoded to
 * /api/form with every form field plus token (reCAPTCHA v3) and formType.
 * 200 "Human" means accepted; 400 means the token failed or scored too low.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://door.taolearning.org/api/form';
  var SITE_KEY = '6LcHIYcUAAAAAPnqH0iBwnDeFma0mWAMJKJHAoEO';

  function loadRecaptcha() {
    if (window.grecaptcha || document.querySelector('script[data-formfunnel-recaptcha]')) return;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_KEY;
    s.async = true;
    s.defer = true;
    s.setAttribute('data-formfunnel-recaptcha', '');
    document.head.appendChild(s);
  }

  function getToken(action) {
    return new Promise(function (resolve, reject) {
      var waited = 0;
      (function wait() {
        if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
          window.grecaptcha.ready(function () {
            window.grecaptcha.execute(SITE_KEY, { action: action }).then(resolve, reject);
          });
        } else if ((waited += 100) > 10000) {
          reject(new Error('reCAPTCHA did not load'));
        } else {
          setTimeout(wait, 100);
        }
      })();
    });
  }

  function notify(ok) {
    var title = ok ? '<strong>Request Sent</strong>' : '<strong>Something went wrong</strong>';
    var html = ok
      ? 'Please check your email for a response from us.'
      : 'We could not send your request. Please try again in a moment.';
    if (typeof window.Swal === 'function') {
      window.Swal({ title: title, type: ok ? 'success' : 'error', html: html, showCloseButton: true });
    } else {
      window.alert(html.replace(/<[^>]+>/g, ' '));
    }
  }

  function isValid(form) {
    var $ = window.jQuery;
    if ($ && $.fn && typeof $.fn.validate === 'function') {
      return $(form).validate().form();
    }
    return typeof form.reportValidity !== 'function' || form.reportValidity();
  }

  function submit(form, formType) {
    if (form.getAttribute('data-formfunnel-busy') === '1') return;
    if (!isValid(form)) return;
    var honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    var button = form.querySelector('[type="submit"]');
    form.setAttribute('data-formfunnel-busy', '1');
    if (button) button.disabled = true;

    getToken(formType)
      .then(function (token) {
        var body = new URLSearchParams(new FormData(form));
        body.set('token', token);
        body.set('formType', formType);
        return fetch(ENDPOINT, { method: 'POST', body: body, mode: 'cors', credentials: 'omit' });
      })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          notify(true);
        } else {
          console.error('formfunnel rejected the submission: HTTP ' + res.status);
          notify(false);
        }
      })
      .catch(function (err) {
        console.error('formfunnel submission failed:', err);
        notify(false);
      })
      .then(function () {
        form.removeAttribute('data-formfunnel-busy');
        if (button) button.disabled = false;
      });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    var formType = form && form.getAttribute && form.getAttribute('data-formfunnel');
    if (!formType) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    submit(form, formType);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecaptcha);
  } else {
    loadRecaptcha();
  }
})();

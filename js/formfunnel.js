/*
 * Site forms -> formfunnel (reCAPTCHA v3 gate) -> the Logic App for the form's type.
 *
 * Any <form data-formfunnel="<formType>"> is handled here: partnership
 * inquiries (formType "inquiry" -> TLI_Interest) and the Curiosity Dispatch
 * newsletter (formType "newsletter": sign-up on the pages that carry the
 * widget, confirm/unsubscribe on get-involved/newsletter.html). The listener
 * runs in the capture phase on document, so it takes the submit before any
 * page handler and stops it.
 *
 * Contract (tao-ninja/formfunnel): POST application/x-www-form-urlencoded to
 * /api/form (the form's own https action if it names one, else ENDPOINT;
 * newsletter forms use forms.curiositycorp.org) with every form field plus token (reCAPTCHA v3, minted with the
 * formType as its action) and formType. 200 "Human" means the Logic App
 * accepted it; 400 means the token failed, scored too low or was minted for
 * another action; 5xx means it could not be delivered.
 *
 * Optional attributes on the form set the message shown afterwards:
 *   data-formfunnel-success-title / data-formfunnel-success-text
 *   data-formfunnel-error-text
 * Text only (no HTML); defaults fit the partnership forms.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://door.taolearning.org/api/form';
  var SITE_KEY = '6LcHIYcUAAAAAPnqH0iBwnDeFma0mWAMJKJHAoEO';

  var DEFAULTS = {
    successTitle: 'Request Sent',
    successText: 'Please check your email for a response from us.',
    errorText: 'We could not send your request. Please try again in a moment.'
  };

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

  // A form whose action is an https formfunnel URL (path /api/form) posts
  // there, so a form can move to its own site's hostname; any other form
  // posts to ENDPOINT.
  function endpointFor(form) {
    var action = form.getAttribute('action');
    if (action) {
      try {
        var url = new URL(action, window.location.href);
        if (url.protocol === 'https:' && url.pathname === '/api/form') return url.href;
      } catch (err) {
        console.error('formfunnel: ignoring unparsable form action', err);
      }
    }
    return ENDPOINT;
  }

  function notify(form, ok) {
    var title = ok
      ? form.getAttribute('data-formfunnel-success-title') || DEFAULTS.successTitle
      : 'Something went wrong';
    var text = ok
      ? form.getAttribute('data-formfunnel-success-text') || DEFAULTS.successText
      : form.getAttribute('data-formfunnel-error-text') || DEFAULTS.errorText;
    // vendor/sweetalert2 is v11: Swal.fire with `icon`; titleText and text
    // are set as plain text, never parsed as HTML.
    if (window.Swal && typeof window.Swal.fire === 'function') {
      window.Swal.fire({
        titleText: title,
        text: text,
        icon: ok ? 'success' : 'error',
        showCloseButton: true
      });
    } else {
      window.alert(title + '\n\n' + text);
    }
    form.dispatchEvent(new CustomEvent('formfunnel:done', { detail: { ok: ok } }));
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
        return fetch(endpointFor(form), { method: 'POST', body: body, mode: 'cors', credentials: 'omit' });
      })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          notify(form, true);
        } else {
          console.error('formfunnel rejected the submission: HTTP ' + res.status);
          notify(form, false);
        }
      })
      .catch(function (err) {
        console.error('formfunnel submission failed:', err);
        notify(form, false);
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

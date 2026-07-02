/*
 * Self-hosted replacement for Mailchimp's legacy embed script, which
 * bundled its own copy of jQuery 1.9.0. Progressively enhances the embedded
 * newsletter form with inline, accessible validation and submits via
 * Mailchimp's JSONP endpoint so no third-party script is loaded. Without
 * JavaScript the form still works: it posts directly to the Mailchimp
 * action URL in a new tab (method="post" target="_blank" are left in place
 * as that fallback).
 */
(function () {
    'use strict';

    var ERROR_COLOR = '#ea205a';
    var SUCCESS_COLOR = '#198754';
    var REQUEST_TIMEOUT_MS = 10000;

    function stripHtml(text) {
        var container = document.createElement('div');
        // Round-trip through textContent so any HTML entities Mailchimp
        // sends (e.g. "&amp;") are decoded, then drop literal tags it
        // sometimes includes (e.g. an "update your preferences" link).
        container.textContent = text;
        return container.textContent.replace(/<[^>]*>/g, '').trim();
    }

    function submitViaJsonp(actionUrl, email, honeypot) {
        return new Promise(function (resolve, reject) {
            var callbackName = 'mcJsonpCallback' + Date.now() + Math.floor(Math.random() * 1e6);
            var script = document.createElement('script');
            var timeoutId;

            function cleanup() {
                clearTimeout(timeoutId);
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }

            window[callbackName] = function (data) {
                cleanup();
                resolve(data);
            };

            var params = new URLSearchParams();
            params.set('EMAIL', email);
            if (honeypot) {
                params.set(honeypot.name, honeypot.value || '');
            }
            params.set('c', callbackName);

            script.src = actionUrl.replace('/post?', '/post-json?') + '&' + params.toString();
            script.async = true;
            script.onerror = function () {
                cleanup();
                reject(new Error('Mailchimp JSONP request failed to load.'));
            };

            timeoutId = setTimeout(function () {
                cleanup();
                reject(new Error('Mailchimp JSONP request timed out.'));
            }, REQUEST_TIMEOUT_MS);

            document.body.appendChild(script);
        });
    }

    function init(form) {
        var emailInput = form.querySelector('input[type="email"]');
        var errorEl = form.querySelector('#mce-error-response');
        var successEl = form.querySelector('#mce-success-response');
        var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        var honeypot = form.querySelector('input[name^="b_"]');

        if (!emailInput || !errorEl || !successEl) {
            return;
        }

        errorEl.setAttribute('role', 'alert');
        successEl.setAttribute('role', 'status');
        emailInput.setAttribute('aria-describedby', errorEl.id);

        function hideMessages() {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
            successEl.style.display = 'none';
            successEl.textContent = '';
        }

        function showError(message) {
            successEl.style.display = 'none';
            successEl.textContent = '';
            errorEl.style.color = ERROR_COLOR;
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }

        function showSuccess(message) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
            successEl.style.color = SUCCESS_COLOR;
            successEl.textContent = message;
            successEl.style.display = 'block';
        }

        function validateEmail() {
            emailInput.setCustomValidity('');
            if (emailInput.checkValidity()) {
                emailInput.removeAttribute('aria-invalid');
                return true;
            }
            var message = emailInput.validity.valueMissing
                ? 'Please enter your email address.'
                : 'Please enter a valid email address.';
            emailInput.setAttribute('aria-invalid', 'true');
            showError(message);
            return false;
        }

        emailInput.addEventListener('blur', function () {
            if (emailInput.value.trim() !== '') {
                validateEmail();
            }
        });

        emailInput.addEventListener('input', function () {
            if (emailInput.getAttribute('aria-invalid') === 'true') {
                validateEmail();
            }
        });

        function handleResponse(data) {
            var result = data && data.result;
            var message = stripHtml((data && data.msg) || '');
            if (result === 'success') {
                form.reset();
                showSuccess(message || 'Thanks for subscribing!');
            } else {
                showError(message || 'Something went wrong. Please try again later.');
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            hideMessages();

            if (!validateEmail()) {
                emailInput.focus();
                return;
            }

            var action = form.getAttribute('action');
            if (!action) {
                showError('Something went wrong. Please try again later.');
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            submitViaJsonp(action, emailInput.value.trim(), honeypot)
                .then(handleResponse)
                .catch(function () {
                    showError('We could not reach the newsletter service. Please try again later.');
                })
                .then(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                });
        });
    }

    document.querySelectorAll('form[name="mc-embedded-subscribe-form"]').forEach(init);
})();

/*
 * get-involved/newsletter.html: the target of the links in Curiosity Dispatch
 * emails, ?op=confirm&id=<subscription id> and ?op=unsubscribe&id=<id>.
 *
 * Shows the matching one-button form (formType "newsletter", submitted by
 * js/formfunnel.js) with the id filled in, or the "link is incomplete" panel
 * when op or id is missing or malformed. Nothing changes on page load: the
 * visitor presses the button, so link scanners in mail filters that open
 * every URL cannot confirm or cancel a subscription on their own.
 */
(function () {
  'use strict';

  var GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var OPS = ['confirm', 'unsubscribe'];

  function show(root, state) {
    var panels = root.querySelectorAll('[data-newsletter-state]');
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].getAttribute('data-newsletter-state') !== state;
    }
  }

  function init() {
    var root = document.querySelector('[data-newsletter-manage]');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var op = params.get('op');
    var id = (params.get('id') || '').trim();

    if (OPS.indexOf(op) === -1 || !GUID.test(id)) {
      show(root, 'invalid');
      return;
    }

    var panel = root.querySelector('[data-newsletter-state="' + op + '"]');
    var form = panel && panel.querySelector('form');
    var idField = form && form.querySelector('input[name="id"]');
    if (!idField) {
      console.error('newsletter-manage: no form for op ' + op);
      show(root, 'invalid');
      return;
    }
    idField.value = id.toLowerCase();

    form.addEventListener('formfunnel:done', function (e) {
      if (!e.detail || !e.detail.ok) return;
      var text = root.querySelector('[data-newsletter-done-text]');
      if (text) text.textContent = form.getAttribute('data-formfunnel-success-text') || '';
      show(root, 'done');
    });

    show(root, op);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

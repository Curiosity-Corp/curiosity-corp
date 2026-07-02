// Klaro consent-management configuration for curiositycorp.org.
// Governs the only non-essential third-party script this site loads:
// Google AdSense. Stripe (payment) and Google reCAPTCHA (spam
// protection) are functionally necessary for the forms that load
// them and are intentionally not gated here — see
// legal/privacy-policy.html for their processor disclosures.
var klaroConfig = {
  version: 1,
  elementID: 'klaro',
  storageMethod: 'cookie',
  cookieName: 'klaro-consent',
  cookieExpiresAfterDays: 365,
  privacyPolicy: 'legal/privacy-policy.html',
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  noticeAsModal: false,

  translations: {
    en: {
      privacyPolicyUrl: 'legal/privacy-policy.html',
      consentModal: {
        title: 'Privacy & cookie settings',
        description:
          'We use one non-essential service on this page — Google AdSense — which sets third-party cookies to personalize ads and measure their performance. Choose what you allow below. You can change this anytime via "Cookie Settings" in the footer.'
      },
      consentNotice: {
        title: 'We use cookies',
        description:
          'This page uses Google AdSense to show ads, which sets non-essential third-party cookies. We only load it if you accept.',
        learnMore: 'Let me choose'
      },
      acceptAll: 'Accept all',
      acceptSelected: 'Save selection',
      decline: 'Reject all',
      ok: 'Accept all',
      save: 'Save selection',
      close: 'Close',
      purposes: {
        advertising: 'Advertising'
      },
      googleAdsense: {
        title: 'Google AdSense',
        description:
          'Displays contextual and behavioral ads via Google AdSense and sets third-party advertising cookies used to personalize ads and measure their performance.'
      },
      poweredBy: 'Cookie consent by Klaro!'
    }
  },

  services: [
    {
      name: 'googleAdsense',
      title: 'Google AdSense',
      purposes: ['advertising'],
      cookies: [
        // Same-domain leftovers only — the third-party
        // googlesyndication.com/doubleclick.net cookies AdSense
        // actually sets can't be deleted cross-domain by page JS.
        /^_gcl_/,
        'IDE',
        'test_cookie'
      ],
      required: false,
      default: false,
      onlyOnce: false
    }
  ],

  callback: function (consent, app) {
    // Klaro invokes this once per service on every change (and once
    // on load for a returning visitor's stored choice) — `consent`
    // is the boolean grant state for that one service (`app.name`),
    // not an object keyed by purpose. This site registers exactly
    // one service (googleAdsense/advertising), so that boolean is
    // the only signal Consent Mode needs.
    if (window.updateConsentMode) {
      window.updateConsentMode(!!consent);
    }
    try {
      window.localStorage.setItem(
        'klaro-consent-log',
        JSON.stringify({
          service: app && app.name,
          consent: !!consent,
          timestamp: new Date().toISOString()
        })
      );
    } catch (e) {
      // localStorage unavailable (private browsing / disabled) —
      // the Klaro cookie remains the source of truth for consent.
    }
  }
};

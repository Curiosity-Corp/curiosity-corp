// Google Consent Mode v2 defaults + bridge to the Klaro consent
// decision. Must load before Klaro and before the (Klaro-gated)
// Google ad tag — a Google ad tag is present on this page, so
// Consent Mode v2 requires defaulting every signal to "denied"
// before that tag can fire, then updating it once the visitor's
// real choice is known (SOP §15.5).
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});

// Invoked from klaro-config.js's callback whenever the visitor's
// advertising consent changes, including on page load for a
// returning visitor's already-stored choice.
window.updateConsentMode = function (adsGranted) {
  gtag('consent', 'update', {
    ad_storage: adsGranted ? 'granted' : 'denied',
    ad_user_data: adsGranted ? 'granted' : 'denied',
    ad_personalization: adsGranted ? 'granted' : 'denied',
    // No analytics tracker is deployed on this site today — left
    // denied regardless of the advertising choice, so it fails
    // closed if one is ever added without revisiting this file.
    analytics_storage: 'denied'
  });
};

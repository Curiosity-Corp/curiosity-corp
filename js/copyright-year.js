// Auto-updates every footer copyright year so it never goes stale
// (SOP §15.1). Client-side one-liner rather than a build-time
// template — this is a no-build static site, so a build-time year
// would silently drift the moment deploys stop, same failure mode
// as hardcoding it.
document.querySelectorAll('.copyright-year').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

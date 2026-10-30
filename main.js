/* altairk.my.id - shared behaviour
   1. Download buttons pull the LATEST GitHub Release per app (graceful fallback).
   2. Scroll-reveal via IntersectionObserver (never a scroll listener). */
(function () {
  "use strict";

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function fmtSize(b) { return (b / 1048576).toFixed(1).replace(".", ",") + " MB"; }

  var repos = ["ytm-relay", "cyclocomp"];
  repos.forEach(function (repo) {
    fetch("https://api.github.com/repos/AltairKaslana/" + repo + "/releases/latest", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        var apk = (j.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
        var url = apk ? apk.browser_download_url : j.html_url;
        document.querySelectorAll('a[data-repo="' + repo + '"]').forEach(function (a) { a.href = url; });
        var label = [j.tag_name, apk ? fmtSize(apk.size) : ""].filter(Boolean).join(" · ");
        document.querySelectorAll('[data-ver="' + repo + '"]').forEach(function (s) { s.textContent = label; });
      })
      .catch(function () {
        document.querySelectorAll('[data-ver="' + repo + '"]').forEach(function (s) { s.textContent = "Rilis terbaru ada di GitHub"; });
      });
  });

  var revs = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }
})();

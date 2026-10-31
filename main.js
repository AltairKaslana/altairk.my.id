/* altairk.my.id - shared behaviour
   Download buttons pull the LATEST GitHub Release per app, so the version and
   the APK size on the page are never stale and never hand-typed. The answer is
   kept in sessionStorage for six hours: a visitor moving between the three
   pages costs one call per app per session instead of one per page. If the API
   is unreachable the label falls back to pointing at GitHub, which stays true. */
(function () {
  "use strict";

  function fmtSize(b) { return (b / 1048576).toFixed(1).replace(".", ",") + " MB"; }

  var repos = ["rylo", "cyclocomp"];
  var SIX_HOURS = 6 * 60 * 60 * 1000;

  repos.forEach(function (repo) {
    function paint(j) {
      var apk = (j.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
      var url = apk ? apk.browser_download_url : j.html_url;
      document.querySelectorAll('a[data-repo="' + repo + '"]').forEach(function (a) { a.href = url; });
      var label = [j.tag_name, apk ? fmtSize(apk.size) : ""].filter(Boolean).join(" · ");
      document.querySelectorAll('[data-ver="' + repo + '"]').forEach(function (s) { s.textContent = label; });
    }
    function miss() {
      document.querySelectorAll('[data-ver="' + repo + '"]').forEach(function (s) { s.textContent = "Rilis terbaru ada di GitHub"; });
    }

    var hit = null;
    try { hit = JSON.parse(sessionStorage.getItem("rel:" + repo) || "null"); } catch (e) {}
    if (hit && hit.j && Date.now() - hit.t < SIX_HOURS) { paint(hit.j); return; }

    fetch("https://api.github.com/repos/AltairKaslana/" + repo + "/releases/latest")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        try { sessionStorage.setItem("rel:" + repo, JSON.stringify({ t: Date.now(), j: j })); } catch (e) {}
        paint(j);
      })
      .catch(miss);
  });
})();

/* altairk.my.id - shared behaviour
   Download buttons pull the LATEST GitHub Release per app, so the version and
   the APK size on the page are never stale and never hand-typed.

   The cached answer is painted immediately, then revalidated in the background
   after a short window (5 menit). Sebelumnya hasil disimpan 6 jam dan tidak
   pernah dicek ulang, jadi rilis baru bisa tidak terlihat sampai sesi habis.
   Simpanan tetap dipakai kalau API sedang gagal atau kena batas kuota. */
(function () {
  "use strict";

  function fmtSize(b) { return (b / 1048576).toFixed(1).replace(".", ",") + " MB"; }

  var repos = ["rylo", "cyclocomp"];
  var STORE_MS = 6 * 60 * 60 * 1000;
  var REFRESH_MS = 5 * 60 * 1000;
  var KEY = "rel2:";

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
    try { hit = JSON.parse(sessionStorage.getItem(KEY + repo) || "null"); } catch (e) {}
    if (hit && hit.j) paint(hit.j);
    if (hit && hit.j && Date.now() - hit.t < REFRESH_MS) return;

    fetch("https://api.github.com/repos/AltairKaslana/" + repo + "/releases/latest", {cache: "no-store"})
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        try { sessionStorage.setItem(KEY + repo, JSON.stringify({t: Date.now(), j: j})); } catch (e) {}
        paint(j);
      })
      .catch(function () { if (!hit || !hit.j) miss(); });
  });
})();

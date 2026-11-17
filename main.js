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
      // Pilih APK yang namanya memuat tag rilis ini. Sebelumnya diambil .apk
      // pertama, jadi saat satu rilis membawa beberapa APK (v6.2/v6.3/v6.4.1)
      // tombol bisa menunjuk berkas usang yang sudah dihapus -> 404.
      var all = (j.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); });
      var want = String(j.tag_name || "").toLowerCase();
      var apk = all.filter(function (a) {
        return want && a.name.toLowerCase().indexOf(want.replace(/^v/, "")) >= 0;
      })[0] || all[0];
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
    // Simpanan yang lebih tua dari STORE_MS dibuang: URL unduhan di dalamnya
    // bisa sudah mati (aset dihapus / rilis diganti), dan memakainya lagi
    // menghasilkan 404 walau API sedang sehat.
    if (hit && (!hit.j || !hit.t || Date.now() - hit.t > STORE_MS)) {
      hit = null;
      try { sessionStorage.removeItem(KEY + repo); } catch (e) {}
    }
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

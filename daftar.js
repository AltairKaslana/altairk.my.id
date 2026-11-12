/* altairk.my.id - permintaan kode akses Rylo.

   Halaman ini cuma meminta satu kode sekali pakai ke server relay. Akun dan
   sandi sengaja dibuat di aplikasi, bukan di sini: kalau form web ikut mengirim
   sandi, sandi itu harus lewat browser dan perantara, padahal tidak perlu.

   Kode disimpan di sessionStorage hanya supaya tombol "salin" tetap bekerja
   setelah halaman di-refresh. Tidak ada cookie, tidak ada pelacak. */
(function () {
  "use strict";

  var ENDPOINT = "https://musik.altairk.my.id/signup";
  var STORE = "rylo-signup";

  var form = document.getElementById("signupForm");
  var alias = document.getElementById("alias");
  var askBtn = document.getElementById("askBtn");
  var status = document.getElementById("status");
  var result = document.getElementById("result");
  var codeEl = document.getElementById("code");
  var codeMeta = document.getElementById("codeMeta");
  var copyBtn = document.getElementById("copyBtn");
  var againBtn = document.getElementById("againBtn");

  if (!form || !result) return;

  function say(message, kind) {
    status.textContent = message || "";
    status.className = "status" + (kind ? " is-" + kind : "");
  }

  function rupiahDate(epochSeconds) {
    var d = new Date(epochSeconds * 1000);
    try {
      return d.toLocaleString("id-ID", {
        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
      });
    } catch (e) {
      return d.toISOString().slice(0, 16).replace("T", " ");
    }
  }

  function show(payload) {
    codeEl.textContent = payload.code;
    codeMeta.textContent = "Berlaku sampai " + rupiahDate(payload.expires_at) +
      " di server " + payload.server.replace("https://", "") + ".";
    result.hidden = false;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(payload));
    } catch (e) {}
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    if (copyBtn.focus) copyBtn.focus();
  }

  function restore() {
    var raw = null;
    try { raw = sessionStorage.getItem(STORE); } catch (e) {}
    if (!raw) return;
    var payload = null;
    try { payload = JSON.parse(raw); } catch (e) { return; }
    if (!payload || !payload.code || !payload.expires_at) return;
    if (payload.expires_at * 1000 < Date.now()) {
      try { sessionStorage.removeItem(STORE); } catch (e) {}
      return;
    }
    show(payload);
    say("Kode yang kamu minta sebelumnya masih berlaku.", "ok");
  }

  function request() {
    askBtn.disabled = true;
    say("Meminta kode...", "");
    var body = {};
    var name = (alias.value || "").trim();
    if (name) body.alias = name;

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "omit",
      cache: "no-store"
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    }).then(function (res) {
      if (!res.ok) {
        var detail = (res.data && res.data.detail) || "";
        if (res.status === 429) {
          say(detail || "Sudah minta beberapa kode dari jaringan ini. Coba lagi nanti.", "warn");
        } else if (res.status === 403) {
          say(detail || "Pendaftaran publik sedang ditutup. Coba lagi nanti.", "warn");
        } else {
          say(detail || "Server menolak permintaan. Coba lagi sebentar.", "warn");
        }
        return;
      }
      show(res.data);
      say("Kode siap dipakai. Tempel di aplikasi Rylo saat memilih Daftar.", "ok");
    }).catch(function () {
      say("Tidak bisa menghubungi server Rylo. Periksa koneksi, lalu coba lagi.", "warn");
    }).then(function () {
      askBtn.disabled = false;
    });
  }

  function copy() {
    var text = codeEl.textContent || "";
    function done() { say("Kode disalin. Tempel di kolom kode undangan pada aplikasi.", "ok"); }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents(codeEl);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        say("Salin manual: tekan lama kode di atas.", "warn");
      }
      sel.removeAllRanges();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    request();
  });
  copyBtn.addEventListener("click", copy);
  againBtn.addEventListener("click", function () {
    try { sessionStorage.removeItem(STORE); } catch (e) {}
    result.hidden = true;
    say("", "");
    alias.focus();
  });

  restore();
})();

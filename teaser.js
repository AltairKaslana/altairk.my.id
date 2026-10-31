/* altairk.my.id - pemutar teaser Zylo
   Video diputar tanpa suara saat terlihat di layar, lalu berhenti saat keluar
   layar supaya tidak ada suara atau decode yang jalan di luar pandangan. Kalau
   pengunjung menekan jeda, video tidak diputar ulang otomatis sampai ia
   menekan putar. Preferensi reduced-motion dimatikan autoplay-nya, bukan
   tombolnya: yang ingin menonton tetap bisa memutar sendiri. */
(function () {
  "use strict";

  var blocks = document.querySelectorAll("[data-teaser]");
  if (!blocks.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  Array.prototype.forEach.call(blocks, function (block) {
    var frame = block.querySelector(".teaser-frame");
    var video = block.querySelector(".teaser-video");
    var btn = block.querySelector(".teaser-toggle");
    if (!frame || !video || !btn) return;

    function sync() {
      frame.classList.toggle("is-playing", !video.paused);
      btn.setAttribute("aria-label", video.paused ? "Putar video" : "Jeda video");
    }

    function play() {
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () {});
    }

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("ended", sync);
    sync();

    btn.addEventListener("click", function () {
      if (video.paused) {
        frame.removeAttribute("data-user-paused");
        play();
      } else {
        frame.setAttribute("data-user-paused", "");
        video.pause();
      }
    });

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!reduce.matches && !frame.hasAttribute("data-user-paused") && video.paused) play();
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(frame);
  });
})();

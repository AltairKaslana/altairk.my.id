# Kartu OG altairk.my.id

`og-card.html` adalah sumber `assets/og.png`. Berkas ini tidak disajikan ke pengunjung, hanya dibuka lokal untuk render ulang.

Cara render ulang (tidak ada rasterizer SVG di mesin ini, jadi pakai browser):

```
cd /root/projects/altairk.my.id
pgrep -af "http.server"            # pastikan portnya bebas
python3 -m http.server 8901 &      # kalau belum jalan
```

Lalu render dengan Chrome headless (tanpa Playwright, cukup Chrome yang terpasang):

```
cd site
python3 -m http.server 8899 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=4000 \
  --screenshot=assets/og.png \
  "http://127.0.0.1:8899/tools/og-card.html"
```

Hasilnya harus persis 1200x630 (dipakai `og:image:width` / `og:image:height` di keempat halaman).

Sesudah menimpa, periksa:
- `identify` atau PIL: hasil harus persis 1200x630.
- `sha256sum assets/og.png` dan bandingkan dengan `curl -s https://altairk.my.id/assets/og.png | sha256sum` setelah push supaya yakin berkas hidup sama.

Aturan isi kartu ini:

- Latar `#fbfbfd`, tinta `#1d1d1f`, aksen tautan `#0066cc`, sama seperti `style.css`.
- Chip aplikasi memakai latar putih dengan garis rambut, bukan bidang penuh, supaya tidak berebut fokus dengan judul.
- Identitas app hanya muncul di chip: `R` dengan latar `#fbe9dc`, `Z` dengan latar `#dff3f7`.
- Angka di kolom kanan harus nyata (versi Android, 10 metrik, ekspor GPX), bukan klaim pemasaran.

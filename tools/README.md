# Kartu OG altairk.my.id

`og-card.html` adalah sumber `assets/og.png`. Berkas ini tidak disajikan ke pengunjung, hanya dibuka lokal untuk render ulang.

Cara render ulang (tidak ada rasterizer SVG di mesin ini, jadi pakai browser):

```
cd /root/projects/altairk.my.id
pgrep -af "http.server"            # pastikan portnya bebas
python3 -m http.server 8901 &      # kalau belum jalan
```

Lalu lewat browser otomatis: buka `http://127.0.0.1:8901/tools/og-card.html`, set viewport 1200x630 dengan `deviceScaleFactor 1`, tangkap layar, dan simpan hasilnya menimpa `assets/og.png`. Ukuran wajib 1200x630 (dipakai `og:image:width` / `og:image:height` di keempat halaman).

Sesudah menimpa, periksa:
- `identify` atau PIL: hasil harus persis 1200x630.
- `sha256sum assets/og.png` dan bandingkan dengan `curl -s https://altairk.my.id/assets/og.png | sha256sum` setelah push supaya yakin berkas hidup sama.

Aturan isi kartu ini:

- Latar `#0D0B08`, aksen kuningan `#E4BE5B`, sama seperti `style.css`.
- Chip aplikasi memakai outline, bukan bidang penuh, supaya tidak berebut fokus dengan kata beraksen di judul.
- Identitas app hanya muncul di chip: oranye `#F97316` untuk Rylo, cyan `#22D3EE` untuk Zylo.
- Angka di kolom kanan harus nyata (versi Android, ekspor GPX, tanpa iklan), bukan klaim pemasaran.

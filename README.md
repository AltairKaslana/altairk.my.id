# altairk.my.id

Etalase statis untuk dua app buatan sendiri:

- **YTM Relay** — relay musik YouTube Music untuk perangkat lama (KitKat, tanpa Play Services). Repo: `AltairKaslana/ytm-relay`
- **Zylo** — komputer gowes GPS. Repo: `AltairKaslana/cyclocomp`

Situs ini murni HTML/CSS/JS satu berkas (`index.html`), di-host lewat **GitHub Pages** dengan custom domain `altairk.my.id` (lihat `CNAME`). Tombol unduh mengambil APK **rilis terbaru** otomatis dari GitHub Releases lewat GitHub API.

## Deploy
Push ke `main` → GitHub Pages membangun otomatis. Tidak ada build step.

## DNS (di registrar .my.id)
Apex `altairk.my.id` → A record ke IP GitHub Pages:
`185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`

`www` → CNAME ke `altairkaslana.github.io`

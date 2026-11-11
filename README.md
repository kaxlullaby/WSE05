# Praktikum 05 – Web Service Engineering

**Desain Endpoint dan Implementasi Web Service dengan Framework**  
Studi kasus: API Katalog Buku Perpustakaan Kampus

## Identitas

- Nama: Resdhika rifki julion tieono
- NIM: 240104040134
- Mata kuliah: Web Service Engineering
- Dosen pengampu: Muhayat, M.IT

## Deskripsi

Proyek ini merupakan REST API katalog buku yang dibuat menggunakan Node.js dan Express. API menyediakan operasi untuk membaca daftar dan detail buku, mencari judul, menambahkan buku, mengganti data buku, serta menghapus buku. Struktur kode dipisahkan menjadi router, controller, service, dan repository.

## Teknologi

- Node.js 24.x
- npm
- Express 5.3.0
- swagger-ui-express 5.0.1
- OpenAPI 3.1.0
- Swagger UI

## Struktur Proyek

```text
praktikum05-webservice/
├── app.cjs
├── server.cjs
├── client.cjs
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── errors.cjs
│   ├── buku.repository.cjs
│   ├── buku.service.cjs
│   ├── buku.controller.cjs
│   └── buku.routes.cjs
├── scripts/
│   └── generate-openapi.cjs
├── docs/
│   └── openapi.json
└── samples/
    ├── buku-baru.json
    ├── buku-ubah.json
    ├── buku-salah-tipe.json
    ├── buku-parsial.json
    └── json-rusak.txt
```

## Instalasi dan Menjalankan Proyek

Pastikan terminal berada pada folder akar proyek, yaitu folder yang berisi `package.json`.

Pasang dependensi sesuai lockfile:

```bash
npm ci
```

Buat ulang dokumen OpenAPI:

```bash
npm run docs
```

Jalankan server:

```bash
npm start
```

Jika berhasil, server berjalan pada:

```text
http://127.0.0.1:3200
```

Biarkan terminal server tetap aktif. Gunakan terminal kedua untuk mengirim request. Untuk menghentikan server, tekan `Ctrl+C` pada terminal pertama.

## Alamat Layanan dan Dokumentasi

| Kegunaan | Alamat |
| --- | --- |
| API katalog | `http://127.0.0.1:3200/api/buku` |
| OpenAPI JSON | `http://127.0.0.1:3200/openapi.json` |
| Swagger UI | `http://127.0.0.1:3200/docs/` |

## Daftar Endpoint

| Metode | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/buku` | Membaca daftar buku |
| GET | `/api/buku?q=kotlin` | Mencari buku berdasarkan judul |
| GET | `/api/buku/:id` | Membaca detail buku |
| POST | `/api/buku` | Menambahkan buku |
| PUT | `/api/buku/:id` | Mengganti seluruh field buku |
| DELETE | `/api/buku/:id` | Menghapus buku |

### Contoh Body POST dan PUT

```json
{
  "judul": "Belajar API dengan Express",
  "tersedia": true
}
```

Field `id` dibuat oleh server dan tidak dikirim pada body. Field `judul` wajib berupa string dengan panjang 1–120 unit string JavaScript setelah trim. Field `tersedia` wajib berupa boolean. PUT harus mengirim kedua field tersebut secara lengkap.

## Contoh Pengujian dari Terminal

Membaca daftar:

```bash
node client.cjs GET /api/buku
```

Membaca detail:

```bash
node client.cjs GET /api/buku/1
```

Mencari judul:

```bash
node client.cjs GET "/api/buku?q=kotlin"
```

Menambahkan buku:

```bash
node client.cjs POST /api/buku samples/buku-baru.json
```

Memperbarui buku (ganti `3` dengan ID yang benar-benar dikembalikan server):

```bash
node client.cjs PUT /api/buku/3 samples/buku-ubah.json
```

Menghapus buku:

```bash
node client.cjs DELETE /api/buku/3
```

## Validasi dan Error Handling

API menangani beberapa kondisi berikut:

- `400 INVALID_ID`: format ID tidak sah.
- `400 INVALID_QUERY`: query pencarian tidak sesuai.
- `400 INVALID_BOOK`: struktur atau tipe field buku tidak sesuai.
- `400 INVALID_JSON`: body bukan JSON yang valid.
- `404 BOOK_NOT_FOUND`: buku tidak ditemukan.
- `404 ROUTE_NOT_FOUND`: path tidak tersedia.
- `413 PAYLOAD_TOO_LARGE`: body melebihi batas 10 KB.
- `415 UNSUPPORTED_MEDIA_TYPE`: Content-Type bukan `application/json`.
- `500 INTERNAL_ERROR`: kesalahan internal server.

Respons sukses menggunakan `success: true` dan `data`. Respons kesalahan menggunakan `success: false` dan objek `error`. Respons DELETE yang berhasil menggunakan status `204` tanpa body.

## Hasil Pengujian

Seluruh 24 skenario pada matriks pengujian Modul Praktikum 05 telah dijalankan secara aktual dan dinyatakan **LULUS**. Cakupan pengujian meliputi:

1. Pemeriksaan versi dan paket.
2. GET daftar awal dan detail buku.
3. Pencarian dengan hasil dan tanpa hasil.
4. POST, GET hasil POST, PUT, dan DELETE.
5. Validasi ID, body, tipe data, JSON, media type, dan query.
6. Penanganan path yang tidak dikenal.
7. Akses OpenAPI JSON dan Swagger UI.
8. CRUD melalui Swagger UI.
9. Pengujian ketika server dihentikan dan setelah server dijalankan kembali.
10. Instalasi ulang dengan `npm ci`, pembuatan dokumentasi, dan menjalankan server.

Hasil terperinci dicantumkan pada matriks pengujian di laporan praktikum. Screenshot atau log pengujian dilampirkan sebagai bukti pelaksanaan.

## Batasan Proyek

- Data disimpan pada array di memori, bukan database.
- Tidak tersedia autentikasi dan otorisasi.
- Data tambahan yang dibuat selama server berjalan akan hilang ketika server dimulai ulang.
- Proyek ditujukan untuk latihan lokal pada `127.0.0.1`, bukan untuk langsung digunakan sebagai layanan produksi.

## Menjalankan Ulang

Dari folder akar proyek, jalankan:

```bash
npm ci
npm run docs
npm start
```

Kemudian buka `http://127.0.0.1:3200/api/buku` atau `http://127.0.0.1:3200/docs/` untuk memastikan layanan dan dokumentasi dapat diakses.

const fs = require('node:fs');
const path = require('node:path');

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const fields = {
  judul: { type: 'string', description: 'Setelah trim, panjang 1-120 unit UTF-16.' },
  tersedia: { type: 'boolean' }
};

const book = { id: 1, judul: 'Dasar Pemrograman Kotlin', tersedia: true };
const input = { judul: 'Belajar API dengan Express', tersedia: true };

function jsonResponse(description, schema, example) {
  return {
    description,
    content: {
      'application/json': {
        schema: ref(schema),
        ...(example ? { example } : {})
      }
    }
  };
}

const errorDescriptions = {
  400:
    'Input tidak valid atau body JSON tidak dapat diterima. Kode di body: INVALID_ID (ID path bukan digit positif aman), ' +
    'INVALID_QUERY (q bukan satu teks atau lebih dari 80 unit), INVALID_BOOK (field wajib hilang, tipe salah, ' +
    'judul kosong/lebih dari 120 karakter, atau ada field tambahan), INVALID_JSON (sintaks JSON tidak utuh), ' +
    'BAD_REQUEST (permintaan lain tidak dapat diproses).',
  404:
    'Buku tidak ditemukan pada penyimpanan memori (BOOK_NOT_FOUND), atau alamat tidak dikenal (ROUTE_NOT_FOUND). ' +
    'ID yang formatnya sah belum menjamin buku masih ada.',
  413: 'Body melebihi batas parser 10kb (PAYLOAD_TOO_LARGE). Batas diterapkan sebelum validasi buku berjalan.',
  415:
    'Media type body bukan application/json (UNSUPPORTED_MEDIA_TYPE). Berlaku pada POST dan PUT; ' +
    'parameter tambahan pada Content-Type seperti charset tetap diterima.',
  500: 'Kegagalan internal server (INTERNAL_ERROR). Pesan stack trace tidak dikirim ke consumer.'
};

const errorExamples = {
  400: { success: false, error: { code: 'INVALID_BOOK', message: 'Isi hanya judul 1-120 karakter dan tersedia boolean.' } },
  404: { success: false, error: { code: 'BOOK_NOT_FOUND', message: 'Buku tidak ditemukan.' } },
  413: { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Body melebihi batas 10kb.' } },
  415: { success: false, error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Gunakan Content-Type application/json.' } },
  500: { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server.' } }
};

function responses(success, codes) {
  const result = { ...success };
  for (const code of codes) {
    result[code] = jsonResponse(errorDescriptions[code], 'ErrorResponse', errorExamples[code]);
  }
  return result;
}

const body = {
  required: true,
  content: { 'application/json': { schema: ref('BukuInput'), example: input } }
};

const id = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Digit positif tanpa nol di depan; nilai <= 9007199254740991.',
  schema: { type: 'string', pattern: '^[1-9][0-9]*$' },
  example: '1'
};

const created = jsonResponse('Buku dibuat.', 'BukuResponse', { success: true, data: { id: 3, ...input } });
created.headers = {
  Location: { description: 'URI buku baru.', schema: { type: 'string' }, example: '/api/buku/3' }
};

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'API Katalog Perpustakaan',
    version: '1.0.0',
    description:
      'Praktikum lokal tanpa login. Data memori hilang saat restart. ' +
      'POST dan PUT wajib judul serta tersedia, tanpa field tambahan. ' +
      'Kode error: INVALID_ID, INVALID_QUERY, INVALID_BOOK, INVALID_JSON, ' +
      'BOOK_NOT_FOUND, PAYLOAD_TOO_LARGE, UNSUPPORTED_MEDIA_TYPE, ' +
      'ROUTE_NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR.'
  },
  servers: [{ url: 'http://127.0.0.1:3200' }],
  tags: [{ name: 'Buku', description: 'Operasi katalog.' }],
  paths: {
    '/api/buku': {
      get: {
        tags: ['Buku'],
        summary: 'Membaca atau mencari daftar buku',
        description:
          'Mengembalikan array buku; tanpa q seluruh katalog dikirim. q dicocokkan sebagian terhadap judul ' +
          'tanpa memperhatikan huruf besar/kecil, di-trim, dan maksimal 80 unit UTF-16. Pencarian tanpa ' +
          'kecocokan tetap 200 dengan array kosong. Parameter query selain q diabaikan; q yang dikirim ' +
          'lebih dari sekali menghasilkan 400 INVALID_QUERY.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Satu teks, maksimal 80 unit UTF-16; kosong menampilkan semua.',
            schema: { type: 'string' },
            example: 'kotlin'
          }
        ],
        responses: responses(
          { 200: jsonResponse('Daftar buku; boleh kosong.', 'DaftarResponse', { success: true, data: [book] }) },
          [400, 500]
        )
      },
      post: {
        tags: ['Buku'],
        summary: 'Menambahkan buku',
        description:
          'id dibuat server (integer berikutnya) dan tidak dikirim pada body. Berhasil menghasilkan 201 dengan ' +
          'header Location menuju /api/buku/{id} serta objek buku baru. Body wajib judul dan tersedia saja; ' +
          'Content-Type selain application/json ditolak 415, body >10kb ditolak 413, dan isi tidak valid 400.',
        requestBody: body,
        responses: responses({ 201: created }, [400, 413, 415, 500])
      }
    },
    '/api/buku/{id}': {
      parameters: [id],
      get: {
        tags: ['Buku'],
        summary: 'Membaca satu buku',
        description:
          'ID pada path harus berupa digit desimal positif tanpa nol di depan dan berada dalam rentang integer ' +
          'aman JavaScript; format salah menghasilkan 400 INVALID_ID. Format sah tetapi buku tidak ada ' +
          'menghasilkan 404 BOOK_NOT_FOUND. Respons 200 membawa objek tunggal, bukan array.',
        responses: responses(
          { 200: jsonResponse('Buku ditemukan.', 'BukuResponse', { success: true, data: book }) },
          [400, 404, 500]
        )
      },
      put: {
        tags: ['Buku'],
        summary: 'Mengganti seluruh field buku',
        description:
          'Target harus sudah ada (404 bila tidak). Body wajib memuat judul dan tersedia dengan tipe benar ' +
          'tanpa field tambahan, sehingga PUT parsial ditolak 400 INVALID_BOOK dan data tersimpan tidak berubah. ' +
          'id tidak dapat diubah dari body. PATCH tidak disediakan pada kontrak ini.',
        requestBody: body,
        responses: responses({ 200: jsonResponse('Buku diperbarui.', 'BukuResponse') }, [400, 404, 413, 415, 500])
      },
      delete: {
        tags: ['Buku'],
        summary: 'Menghapus buku',
        description:
          'Berhasil menghapus menghasilkan 204 tanpa body JSON. ID salah format 400 INVALID_ID; buku tidak ' +
          'ada 404 BOOK_NOT_FOUND. Penghapusan berulang pada ID yang sama: 204 pada panggilan pertama lalu ' +
          '404 pada panggilan berikutnya.',
        responses: responses({ 204: { description: 'Berhasil tanpa body.' } }, [400, 404, 500])
      }
    }
  },
  components: {
    schemas: {
      BukuInput: {
        type: 'object',
        additionalProperties: false,
        required: ['judul', 'tersedia'],
        properties: fields
      },
      Buku: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'judul', 'tersedia'],
        properties: {
          id: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
          ...fields
        }
      },
      BukuResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: { success: { const: true }, data: ref('Buku') }
      },
      DaftarResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: { success: { const: true }, data: { type: 'array', items: ref('Buku') } }
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { const: false },
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: { code: { type: 'string' }, message: { type: 'string' } }
          }
        }
      }
    }
  }
};

const target = path.join(__dirname, '..', 'docs', 'openapi.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(spec, null, 2) + '\n');
console.log('Dokumen dibuat: docs/openapi.json');

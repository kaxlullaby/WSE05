let buku = [
  { id: 1, judul: 'Dasar Pemrograman Kotlin', tersedia: true },
  { id: 2, judul: 'Dasar Web Service', tersedia: false },
  { id: 3, judul: 'Pemrograman Berorientasi Objek', tersedia: true },
  { id: 4, judul: 'Pemrograman Dasar', tersedia: false },
  { id: 5, judul: 'Pemrograman Web', tersedia: true }
];
let nextId = 6;

module.exports = {
  list(q = '') {
    return buku.filter((item) => item.judul.toLowerCase().includes(q.toLowerCase()));
  },
  find(id) {
    return buku.find((item) => item.id === id);
  },
  create(data) {
    const item = { id: nextId++, ...data };
    buku.push(item);
    return item;
  },
  replace(id, data) {
    const index = buku.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    buku[index] = { id, ...data };
    return buku[index];
  },
  remove(id) {
    const index = buku.findIndex((item) => item.id === id);
    if (index === -1) return false;
    buku.splice(index, 1);
    return true;
  }
};

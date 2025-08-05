# 🛒 FreshMarket – Online Grocery Web App

**FreshMarket** adalah aplikasi e-commerce berbasis web untuk kebutuhan belanja harian yang berfokus pada pemilihan toko berdasarkan lokasi pengguna. Proyek ini merupakan hasil kolaborasi tim dalam mengembangkan platform dengan berbagai fitur, mulai dari pencarian produk berbasis lokasi, manajemen pesanan, promosi dinamis, hingga dashboard admin yang lengkap.

---

## 🚀 Tech Stack

### 🌐 Frontend

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **State Management**: Redux Toolkit
* **API Request**: Axios
* **Authentication**: JWT (via cookies/localStorage)
* **Deployment**: Vercel

### 🛠 Backend

* **Framework**: Express.js
* **Language**: TypeScript
* **ORM**: Prisma
* **Database**: PostgreSQL
* **Auth**: JWT
* **File Upload**: Multer + Cloudinary
* **Payment**: Midtrans Snap API + Webhook
* **Email**: Nodemailer + Handlebars
* **Scheduler**: Cron Job (auto-cancel & auto-confirm order)
* **Deployment**: Vercel + Railway (Failed)

---

## 👥 User Roles

| Role            | Deskripsi                                                                |
| --------------- | ------------------------------------------------------------------------ |
| **User**        | Pembeli yang dapat berbelanja, mengelola alamat, melihat status pesanan. |
| **Store Admin** | Mengelola stok & pesanan toko tertentu.                                  |
| **Super Admin** | Mengelola seluruh toko, kategori, produk, user & diskon.                 |

---

## 🌟 Fitur Utama

### 📍 Lokasi & Rekomendasi Toko

* Deteksi lokasi pengguna saat membuka landing page
* Rekomendasi toko terdekat
* Produk & stok berdasarkan lokasi toko
* Pesanan diproses oleh toko terdekat

### 🛒 Belanja & Checkout

* Cart per toko
* Checkout berdasarkan alamat dan metode pengiriman
* Ongkir berdasarkan jarak (API seperti RajaOngkir)
* Upload bukti bayar (manual) atau via Midtrans
* Voucher (diskon produk, transaksi, atau ongkir)

### 📦 Manajemen Pesanan

* **Status Pesanan**: `MENUNGGU_PEMBAYARAN` → `KONFIRMASI` → `DIPROSES` → `DIKIRIM` → `DIKONFIRMASI`
* Auto cancel jika tidak upload bukti bayar dalam 1 jam
* Auto confirm 7 hari setelah pesanan dikirim

### 🔐 Autentikasi & Profil

* Registrasi (email / social login)
* Verifikasi email + set password
* Reset password (2-step)
* Update profil (termasuk foto)
* Verifikasi ulang email

### 🏪 Store & Produk (Admin)

* CRUD Produk & Kategori
* Multi-image upload
* Manajemen diskon: fixed / persentase / beli 1 gratis 1
* Manajemen stok dengan jurnal (log perubahan stok)
* Filter produk berdasarkan toko

### 📈 Laporan Penjualan & Stok (Admin)

* Laporan penjualan bulanan
* Laporan penjualan per kategori & produk
* Laporan stok masuk/keluar bulanan

---

## 🗃️ Struktur Repositori

### Backend (`freshmarketbackend`)

```
src/
├── controllers/
├── routes/
├── middlewares/
├── services/
├── utils/
├── validations/
├── prisma/
└── interfaces/
```

### Frontend (`freshmarketfrontend`)

```
src/
├── app/                → Routing (App Router)
├── pages/              → Legacy pages (optional)
├── components/         → Reusable components
├── lib/
│   ├── redux/          → Redux slices & store
│   ├── hooks/          → Custom hooks
│   └── validations/    → Zod schemas
```

---

## ⚙️ Setup Lokal

### 1. Clone Repositori

```bash
git clone https://github.com/Abedneg12/freshmarketfrontend.git
git clone https://github.com/Abedneg12/freshmarketbackend.git
```

### 2. Backend Setup

```bash
cd freshmarketbackend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### `.env` Contoh

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...
FE_PORT=http:...
```

### 3. Frontend Setup

```bash
cd freshmarketfrontend
npm install
npm run dev
```

#### `.env.local` Contoh

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📌 Catatan Teknis

* 📦 **Midtrans Webhook**: `/orders/notification`
* 📸 **Image Validation**: JPG/JPEG/PNG/GIF ≤ 1MB
* 🔁 **Pagination & Filtering**: Harus dilakukan server-side
* 🌍 **Location API**: OpenCage / RajaOngkir
* 🔐 **Middleware Auth**: `authOnlyMiddleware`, `verifiedOnlyMiddleware`, `requireRole`

---

## 📊 Evaluasi & Standar

* Semua fitur harus dapat diakses & berjalan dengan baik
* UI harus responsif dan mobile-friendly
* Clean Code (max function 15 baris, max file 200 baris)
* Penamaan file harus jelas dan konsisten

---

## ✨ Contoh UI (Opsional jika ingin ditambahkan screenshot)

| Halaman         | Tampilan |
| --------------- | -------- |
| Homepage        | 🏠       |
| Cart Page       | 🛒       |
| Checkout        | 💳       |
| Admin Dashboard | 🧾       |
| Manage Produk   | 📦       |
| Order Tracking  | 🚚       |

---


##  Account Untuk Testing

Testing Account :
- USER :
      - jerix31490@coderdir.com
      - ayam!3w2

- Store Admin :
      - storeadmin@mail.com
      - storeadmin123

- Super Admin :
      - d81856284@gmail.com
      - gx1+V57~

---


## 👤 Kontributor

* [Abed Nego](https://github.com/Abedneg12)
* [Irga](https://github.com/irgadiputra)
* [Akbar](https://github.com/Bangbays)

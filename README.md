CarePulse adalah aplikasi web manajemen rumah sakit (Monolithic Architecture) yang menghubungkan Pasien, Dokter, Staf, dan Admin dalam satu platform terpadu. Dibangun menggunakan Java Spring Boot (Backend) dan Tailwind CSS + Vanilla JS (Frontend) untuk mendigitalkan alur pelayanan medis secara real-time.

🔄 Alur Kerja Ringkas

Pasien: Membuat akun, memilih jadwal poli, mendapat tiket antrean, dan melihat rekam medis.

Staf Poli: Memantau daftar booking harian dan memvalidasi kehadiran fisik pasien.

Dokter: Memeriksa pasien sesuai urutan sistem, mencatat diagnosis, dan menerbitkan resep.

Admin: Mengelola akses pengguna dan mempublikasikan artikel edukasi kesehatan.

✨ Fitur Utama
Keamanan Data: Enkripsi kata sandi pengguna menggunakan standar BCrypt.

Booking Cerdas: Validasi sisa kuota jadwal dokter secara otomatis di sisi server.

Interaktivitas SPA: Perpindahan antarmuka web yang mulus tanpa muat ulang (loading) halaman berkat pendekatan Single Page Application.

🏛️ Implementasi 4 Pilar PBO (OOP)
Proyek ini dibangun dengan mematuhi prinsip Clean Architecture dan Pemrograman Berorientasi Objek:

Enkapsulasi (Pembungkusan): Melindungi data dengan menjadikan seluruh atribut pada kelas Entitas (seperti password atau nik) sebagai private. Modifikasi hanya bisa dilakukan lewat metode Getter dan Setter.

Inheritance (Pewarisan): Mencegah penulisan kode berulang. Kelas Pasien, Dokter, dan PegawaiPoli diturunkan (extends) dari satu kelas induk utama, yaitu User.

Polimorfisme (Banyak Bentuk): Memanfaatkan Method Overriding dari Spring Data JPA. Metode seperti save() atau findById() otomatis menyesuaikan bentuk dan fungsinya tergantung entitas apa yang dipanggil.

Abstraksi (Penyembunyian Kerumitan): Menyembunyikan baris kode SQL yang rumit ke dalam Repository (Interface), serta memindahkan logika perhitungan kuota yang panjang ke Service Layer, sehingga Controller tetap sangat bersih.

Anggota :
1. Octho Rivaldo Sinaga (241401122)
2. Rusydi Arrafi (241401023)
3. Andareas Pegri Damanik (241401116)

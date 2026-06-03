// ========================================================================
// KONFIGURASI UI & NOTIFIKASI (SWEETALERT2)
// ========================================================================
const showNotif = (tipe, judul, pesan) => {
    Swal.fire({
        icon: tipe, // 'success', 'error', 'warning', 'info'
        title: judul,
        text: pesan,
        confirmButtonColor: '#004ac6',
        customClass: {
            popup: 'rounded-3xl',
            confirmButton: 'rounded-xl font-bold px-6 py-3'
        }
    });
};

const showToast = (pesan) => {
    Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: pesan,
        showConfirmButton: false, timer: 3000, timerProgressBar: true
    });
};
// ========================================================================
// SISTEM OTENTIKASI (LOGIN & REGISTER) - INI YANG MEMBUAT ANDA BISA PINDAH HALAMAN
// ========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Login
    const loginForm = document.getElementById('loginFormAPI');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Mencegah browser me-refresh otomatis
            const btn = document.getElementById('login-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = "Memeriksa...";

            try {
                const res = await postData('/api/login', {
                    email: document.getElementById('login-email').value,
                    password: document.getElementById('login-password').value
                });

                if (res.status === 'success') {
                    // Simpan data di memori browser
                    sessionStorage.setItem('userEmail', res.email);
                    sessionStorage.setItem('userNama', res.nama);

                    alert(`Selamat datang kembali, ${res.nama}!`);

                    // PINDAH HALAMAN BERDASARKAN ROLE
                    if (res.role === 'ADMIN') {
                        window.location.href = '/admin';
                    } else if (res.role === 'DOKTER') {
                        window.location.href = '/dokter';
                    } else if (res.role === 'POLI') {
                        window.location.href = '/staf-poli';
                    } else {
                        window.location.href = '/pasien'; // Rute default
                    }
                }
            } catch (error) {
                alert("Gagal Masuk: " + error.message);
                btn.innerHTML = originalText;
            }
        });
    }

    // 2. Logika Register Web
    const registerForm = document.getElementById('registerFormAPI');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                await postData('/api/register', {
                    nama: document.getElementById('reg-name').value,
                    email: document.getElementById('reg-email').value,
                    password: document.getElementById('reg-password').value,
                    nik: document.getElementById('reg-nik').value,
                    tanggalLahir: document.getElementById('reg-dob').value,
                    jenisKelamin: document.getElementById('reg-gender').value
                });
                alert("Pendaftaran Sukses! Silakan masuk dengan email Anda.");
                toggleAuth('login'); // Langsung geser ke form login
            } catch (error) {
                alert("Gagal Daftar: " + error.message);
            }
        });
    }
});


// ========================================================================
// SISTEM NAVIGASI (SPA)
// ========================================================================
function navigateTo(pageId, pushState = true) {
    document.querySelectorAll('.spa-page').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushState) history.pushState({ page: pageId }, "", "#" + pageId);

    // Trigger pengambilan data sesuai halaman
    if (pageId === 'view-dashboard-pasien') loadDashboardPasien();
    if (pageId === 'view-cari-dokter') loadBookingData();
    if (pageId === 'view-dashboard-admin') loadAdminData();
    if (pageId === 'view-beranda') muatArtikelDiBeranda();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof muatTabelAkunAdmin === "function") muatTabelAkunAdmin();
    if (typeof muatArtikelDiBeranda === "function") muatArtikelDiBeranda();
});

function toggleAuth(view) {
    document.getElementById('login-container').style.display = view === 'login' ? 'block' : 'none';
    document.getElementById('register-container').style.display = view === 'register' ? 'block' : 'none';
    const forgotContainer = document.getElementById('forgot-container');
    if(forgotContainer) forgotContainer.style.display = view === 'forgot' ? 'block' : 'none';
}

window.addEventListener('popstate', e => e.state && e.state.page ? navigateTo(e.state.page, false) : navigateTo('view-beranda', false));

function logout() {
    if(confirm("Log keluar dari sistem?")) {
        sessionStorage.clear();
        document.getElementById('loginFormAPI')?.reset();
        window.location.href = '/'; // Kembali ke halaman utama
    }
}

async function postData(url, data) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Terjadi kesalahan jaringan');
    return result;
}

// ========================================================================
// INTEGRASI API: PASIEN, DOKTER, DAN STAF POLI (REAL-TIME DATA)
// ========================================================================

// --- 1. MENGISI TABEL RIWAYAT PASIEN (`pasien.html`) ---
async function muatRiwayatPasien() {
    if (!window.location.pathname.includes('/pasien')) return;
    const tbodyRiwayat = document.querySelector('table tbody');
    if (!tbodyRiwayat) return;

    const email = sessionStorage.getItem('userEmail');
    if (!email) return;

    tbodyRiwayat.innerHTML = '<tr><td colspan="5" class="text-center py-4 font-bold text-primary">Memuat data dari server...</td></tr>';

    try {
        const res = await fetch(`/api/pasien/riwayat?email=${email}`);
        if (res.ok) {
            const riwayat = await res.json();
            tbodyRiwayat.innerHTML = '';

            if (riwayat.length === 0) {
                tbodyRiwayat.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-on-surface-variant">Belum ada riwayat kunjungan medis.</td></tr>';
                return;
            }

            riwayat.forEach(item => {
                let badgeStatus = item.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                let aksi = '-';
                let diagnosis = 'Menunggu Pemeriksaan';

                if (item.status === 'SELESAI' && item.keluhan) {
                    diagnosis = item.keluhan.includes('Diagnosis: ') ? item.keluhan.split('Diagnosis: ')[1].split(' | ')[0] : 'Selesai';
                    let resep = item.keluhan.includes('Resep Obat: ') ? item.keluhan.split('Resep Obat: ')[1] : 'Tidak ada resep';
                    aksi = `<button onclick="alert('Resep Obat Anda:\\n\\n${resep}')" class="text-primary hover:underline font-medium text-xs flex items-center justify-center gap-1 mx-auto"><span class="material-icons" style="font-size:14px;">medication</span> Lihat Resep</button>`;
                }

                tbodyRiwayat.innerHTML += `
                    <tr class="border-b border-outline-variant/10 hover:bg-surface/50 transition-colors">
                        <td class="py-3">${item.tanggalKunjungan}</td>
                        <td class="py-3 font-semibold text-on-surface">Dr. ${item.dokter.namaLengkap}</td>
                        <td class="py-3"><span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">${diagnosis}</span></td>
                        <td class="py-3"><span class="${badgeStatus} px-2 py-1 rounded text-[10px] font-bold uppercase border">${item.status}</span></td>
                        <td class="py-3 text-center">${aksi}</td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbodyRiwayat.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-error">Gagal menyambung ke database.</td></tr>';
    }
}

// --- 2. MENGISI DAFTAR ANTREAN DOKTER (`dokter.html`) ---
let janjiAktifId = null;

async function muatAntreanDokter() {
    if (!window.location.pathname.includes('/dokter')) return;
    const containerPasien = document.querySelector('.bg-surface-container-lowest .space-y-3.flex-1');
    if (!containerPasien) return;

    const email = sessionStorage.getItem('userEmail');
    containerPasien.innerHTML = '<p class="text-sm text-center py-4 font-bold text-primary animate-pulse">Sinkronisasi Antrean...</p>';

    try {
        const res = await fetch(`/api/dokter/antrean-hari-ini?email=${email}`);
        if (res.ok) {
            const antrean = await res.json();
            containerPasien.innerHTML = '';

            if (antrean.length === 0) {
                containerPasien.innerHTML = '<p class="text-sm text-center py-8 text-on-surface-variant">Bagus! Tidak ada pasien yang menunggu di luar saat ini.</p>';
                return;
            }

            antrean.forEach(item => {
                containerPasien.innerHTML += `
                    <div id="card-pasien-${item.id}" class="border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center hover:border-primary transition-colors bg-white shadow-sm mb-3">
                        <div>
                            <p class="font-bold text-sm text-on-surface">${item.pasien.namaLengkap}</p>
                            <p class="text-[11px] text-on-surface-variant">Antrean: <span class="text-primary font-bold">${item.nomorAntreanUrut}</span> • ID Tiket: ${item.kodeTiket}</p>
                        </div>
                        <button onclick="bukaFormPeriksaReal(${item.id}, '${item.pasien.namaLengkap}', '${item.nomorAntreanUrut}', '${item.keluhan}')" class="bg-primary/10 text-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition shadow-sm">
                            Panggil Pasien
                        </button>
                    </div>
                `;
            });
        }
    } catch (e) {
        containerPasien.innerHTML = '<p class="text-sm text-center py-4 text-error">Koneksi terputus.</p>';
    }
}

window.bukaFormPeriksaReal = function(id, nama, antrean, keluhan) {
    janjiAktifId = id;
    document.getElementById('nama-pasien-aktif').innerHTML = `Sedang Memeriksa: <strong class="text-primary text-lg">${nama} (Antrean: ${antrean})</strong><br><span class="text-xs text-on-surface-variant">Keluhan Awal: ${keluhan || '-'}</span>`;
    const form = document.getElementById('form-periksa');
    form.classList.remove('opacity-50', 'pointer-events-none');
    document.getElementById('input-diagnosis').focus();
};

document.getElementById('form-periksa')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!janjiAktifId) return;
    try {
        await postData('/api/layanan/periksa-selesai', { janjiId: janjiAktifId, diagnosis: document.getElementById('input-diagnosis').value, resep: document.getElementById('input-resep').value });
        alert('Pemeriksaan Selesai! Resep otomatis masuk ke aplikasi pasien.');
        e.target.reset();
        e.target.classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('nama-pasien-aktif').innerText = "Pilih pasien di daftar antrean untuk memulai.";
        muatAntreanDokter();
    } catch (err) { alert('Gagal menyimpan rekam medis: ' + err.message); }
});

// --- 3. MENGISI DAFTAR ANTREAN STAF POLI (`staf-poli.html`) ---
async function muatAntreanStafPoli() {
    if (!window.location.pathname.includes('/staf-poli')) return;
    const tbodyStaf = document.querySelector('table tbody');
    if (!tbodyStaf) return;

    tbodyStaf.innerHTML = '<tr><td colspan="5" class="text-center py-4 font-bold text-primary">Memuat manifes kehadiran...</td></tr>';

    try {
        const res = await fetch('/api/layanan/daftar-antrean');
        if (res.ok) {
            const antrean = await res.json();
            tbodyStaf.innerHTML = '';
            if (antrean.length === 0) { tbodyStaf.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-on-surface-variant">Belum ada pasien yang mengambil tiket untuk poliklinik ini.</td></tr>'; return; }

            antrean.forEach(item => {
                let btnHtml = '-'; let badgeHtml = ''; let bgRow = '';
                if (item.status === 'Umum' || item.status === 'MENUNGGU') {
                    bgRow = 'bg-yellow-50/20'; badgeHtml = `<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[11px] font-bold border border-yellow-200">Menunggu Hadir</span>`;
                    btnHtml = `<button onclick="accKehadiranReal(${item.id}, '${item.pasien.namaLengkap}')" class="bg-green-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-1 mx-auto"><span class="material-icons" style="font-size: 14px;">check_circle</span> ACC Hadir</button>`;
                } else if (item.status === 'TIBA_DI_POLI') {
                    badgeHtml = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-[11px] font-bold border border-green-200">Menunggu Dokter</span>`;
                    btnHtml = `<span class="text-on-surface-variant text-[11px] font-bold"><span class="material-icons text-green-600 align-middle" style="font-size: 14px;">done_all</span> Tervalidasi</span>`;
                } else { badgeHtml = `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-[11px] font-bold">${item.status}</span>`; }

                tbodyStaf.innerHTML += `
                    <tr class="border-b border-outline-variant/10 hover:bg-surface/50 transition-colors ${bgRow}">
                        <td class="py-3 text-center"><span class="font-display font-bold text-xl ${item.status === 'TIBA_DI_POLI' ? 'text-on-surface-variant' : 'text-primary'}">${item.nomorAntreanUrut}</span></td>
                        <td class="py-3"><p class="font-bold text-on-surface">${item.pasien.namaLengkap}</p><p class="text-[11px] text-on-surface-variant font-mono">${item.kodeTiket}</p></td>
                        <td class="py-3 font-medium text-on-surface">${item.jadwalPraktik?.jamMulai || '-'} WIB</td>
                        <td class="py-3">${badgeHtml}</td>
                        <td class="py-3 text-center">${btnHtml}</td>
                    </tr>
                `;
            });
        }
    } catch (e) { tbodyStaf.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-error">Database tidak merespons.</td></tr>'; }
}

window.accKehadiranReal = async function(janjiId, namaPasien) {
    if (confirm(`Konfirmasi bahwa Pasien atas nama ${namaPasien} sudah hadir fisik di ruangan Poliklinik?`)) {
        try {
            await postData('/api/layanan/check-in', { janjiId: janjiId });
            alert("ACC Sukses! Pasien kini muncul di layar Dokter.");
            muatAntreanStafPoli();
        } catch (err) { alert("Gagal melakukan ACC: " + err.message); }
    }
};

// --- 4. PEMICU OTOMATIS SAAT HALAMAN DIBUKA ---
document.addEventListener('DOMContentLoaded', () => {
    muatRiwayatPasien();
    muatAntreanDokter();
    muatAntreanStafPoli();
});

document.getElementById('booking-poli')?.addEventListener('change', async (e) => {
    const poliId = e.target.value; const selJadwal = document.getElementById('booking-jadwal');
    if(!poliId) { selJadwal.innerHTML = '<option value="">-- Pilih Poli Dahulu --</option>'; return; }
    selJadwal.innerHTML = '<option value="">Memuat Jadwal Dokter...</option>';
    try {
        const res = await fetch(`/api/pasien/list-jadwal-poli?poliId=${poliId}`);
        if(res.ok) {
            selJadwal.innerHTML = '<option value="">-- Pilih Dokter & Jadwal --</option>';
            (await res.json()).forEach(j => selJadwal.innerHTML += `<option value="${j.id}">${j.namaDokter} | ${j.hari} (${j.jamMulai} - ${j.jamSelesai})</option>`);
        }
    } catch(e){}
});

document.getElementById('formBookingAPI')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await postData('/api/pasien/booking', { pasienId: document.getElementById('booking-pasien').value, jadwalId: document.getElementById('booking-jadwal').value, tanggal: document.getElementById('booking-tanggal').value, keluhan: document.getElementById('booking-keluhan').value });
        alert(`BERHASIL!\n\nNomor Antrean Anda: ${res.kodeTiket}\n\n${res.message}`);
        e.target.reset(); navigateTo('view-dashboard-pasien');
    } catch (err) { alert("GAGAL MEMBUAT JANJI:\n" + err.message); }
});

async function handleChangePassword(e, oldPassId, newPassId) {
    e.preventDefault();
    try { await postData('/api/change-password', { email: sessionStorage.getItem('userEmail'), oldPassword: document.getElementById(oldPassId).value, newPassword: document.getElementById(newPassId).value }); alert("Kata sandi berhasil diubah!"); e.target.reset(); } catch (err) { alert(err.message); }
}
document.getElementById('formChangePassDokter')?.addEventListener('submit', (e) => handleChangePassword(e, 'dokter-old-pass', 'dokter-new-pass'));
document.getElementById('formChangePassPasien')?.addEventListener('submit', (e) => handleChangePassword(e, 'pasien-old-pass', 'pasien-new-pass'));

// --- 5. LOGIKA DASHBOARD ADMIN ---
async function muatTabelAkunAdmin() {
    const tabelBody = document.getElementById('tabel-body-akun');
    if(!tabelBody) return;
    tabelBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Memuat data dari database...</td></tr>';
    try {
        const res = await fetch('/api/admin/list-users');
        if(res.ok) {
            const dataPengguna = await res.json();
            tabelBody.innerHTML = '';
            dataPengguna.forEach(user => {
                let badgeClass = "bg-gray-100 text-gray-700 border-gray-200"; let icon = "person"; let roleName = user.role;
                if (user.role === 'PASIEN') { badgeClass = 'badge-pasien'; icon = 'personal_injury'; }
                else if (user.role === 'DOKTER') { badgeClass = 'badge-dokter'; icon = 'medical_services'; }
                else if (user.role === 'PEGAWAI_POLI') { badgeClass = 'badge-staf'; icon = 'assignment_ind'; roleName = 'STAF POLI'; }
                else if (user.role === 'ADMIN') { badgeClass = 'bg-red-100 text-red-700 border-red-200'; icon = 'admin_panel_settings'; }

                tabelBody.innerHTML += `
                    <tr class="hover:bg-surface/50 transition-colors">
                        <td class="py-3 px-5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">${user.namaLengkap.charAt(0).toUpperCase()}</div>
                                <div><p class="font-bold text-on-surface">${user.namaLengkap}</p><p class="text-[11px] text-on-surface-variant">${user.email}</p></div>
                            </div>
                        </td>
                        <td class="py-3 px-5"><span class="${badgeClass} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center w-max gap-1"><span class="material-icons" style="font-size: 12px;">${icon}</span> ${roleName}</span></td>
                        <td class="py-3 px-5"><p class="text-[11px] text-on-surface-variant">ID: ${user.id}</p></td>
                        <td class="py-3 px-5"><div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-green-500"></div><span class="text-xs font-semibold text-green-700">Aktif</span></div></td>
                        <td class="py-3 px-5 text-center"><button class="text-error hover:bg-red-50 p-1.5 rounded transition"><span class="material-icons" style="font-size: 18px;">block</span></button></td>
                    </tr>
                `;
            });
        }
    } catch(e) { tabelBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-error">Gagal memuat data.</td></tr>'; }
}

// --- 6. LOGIKA ARTIKEL MEDIS ---
document.getElementById('formAddArtikel')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-simpan-artikel');
    btn.innerHTML = "Mempublikasikan...";
    try {
        await postData('/api/artikel/tambah', { judul: document.getElementById('artikel-judul').value, konten: document.getElementById('artikel-konten').value, namaPenulis: sessionStorage.getItem('userNama') || 'Admin Pusat' });
        alert("Berhasil! Artikel sudah tayang di Beranda Publik.");
        e.target.reset();
    } catch (err) { alert("Gagal menyimpan artikel: " + err.message); } finally { btn.innerHTML = `<span class="material-icons" style="font-size: 18px;">publish</span> Publikasikan ke Publik`; }
});

async function muatArtikelDiBeranda() {
    const wadahArtikel = document.getElementById('artikel-container');
    if(!wadahArtikel) return;
    try {
        const res = await fetch('/api/artikel/list');
        if(res.ok) {
            const daftarArtikel = await res.json();
            if(daftarArtikel.length === 0) { wadahArtikel.innerHTML = '<div class="col-span-3 text-center py-12 text-on-surface-variant">Belum ada artikel medis yang dipublikasikan.</div>'; return; }
            wadahArtikel.innerHTML = '';
            daftarArtikel.forEach(artikel => {
                wadahArtikel.innerHTML += `
                    <div class="bg-white border border-outline-variant/30 rounded-3xl p-6 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="material-icons text-primary" style="font-size: 18px;">article</span>
                            <span class="text-[10px] font-bold text-primary bg-primary-fixed px-2 py-1 rounded">EDUKASI</span>
                        </div>
                        <h3 class="font-display font-bold text-xl mb-2 text-on-surface">${artikel.judul}</h3>
                        <p class="text-on-surface-variant text-sm mb-4 line-clamp-3">${artikel.konten}</p>
                        <div class="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                            <p class="text-[10px] text-on-surface-variant font-medium">Oleh: ${artikel.namaPenulis}</p>
                            <p class="text-[10px] text-on-surface-variant font-medium">${artikel.tanggalPublikasi}</p>
                        </div>
                    </div>
                `;
            });
        }
    } catch(e) { wadahArtikel.innerHTML = '<div class="col-span-3 text-center py-12 text-error">Gagal mengambil data artikel dari server.</div>'; }
}
import { apiClient } from './api.js';
import { uiManager } from './ui.js';

// 1. FUNGSI INISIALISASI (Dipanggil otomatis saat halaman terbuka)
export const initDashboard = () => {
    const role = sessionStorage.getItem('userRole');
    const nama = sessionStorage.getItem('userNama');
    const email = sessionStorage.getItem('userEmail');

    // Ubah nama profil di sidebar sesuai data login
    if (nama) {
        const profileNameEls = document.querySelectorAll('aside h3.font-bold');
        profileNameEls.forEach(el => el.textContent = nama);
    }

    // Eksekusi fungsi penarikan data sesuai halaman yang sedang dibuka
    const path = window.location.pathname;
    if (path.includes('/staf-poli')) loadDaftarAntreanStaf();
    if (path.includes('/dokter')) loadPasienDokter(email);
};

// ==========================================
// ALUR 1: STAF POLI (Tampilkan & ACC Antrean)
// ==========================================
window.loadDaftarAntreanStaf = async function() {
    try {
        const data = await apiClient.get('/layanan/daftar-antrean');
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        tbody.innerHTML = ''; // Kosongkan data HTML dummy
        
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-sm text-gray-500">Belum ada antrean masuk hari ini.</td></tr>';
            return;
        }

        data.forEach(janji => {
            const isMenunggu = janji.status === 'MENUNGGU';
            const statusHtml = isMenunggu 
                ? `<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[11px] font-bold border border-yellow-200">Menunggu ACC</span>`
                : `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-[11px] font-bold border border-green-200">Siap Diperiksa</span>`;
            
            const btnHtml = isMenunggu
                ? `<button onclick="accKehadiran(${janji.id})" class="bg-green-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-1 mx-auto"><span class="material-icons" style="font-size: 14px;">check_circle</span> ACC Hadir</button>`
                : `<span class="text-gray-500 text-[11px] font-bold">Selesai ACC</span>`;

            tbody.innerHTML += `
                <tr class="border-b border-outline-variant/10 hover:bg-gray-50 transition-colors">
                    <td class="py-3 text-center"><span class="font-display font-bold text-lg text-primary">A${janji.nomorAntreanUrut}</span></td>
                    <td class="py-3"><p class="font-bold text-on-surface">${janji.pasien.namaLengkap}</p><p class="text-[11px] text-on-surface-variant">${janji.kodeTiket}</p></td>
                    <td class="py-3 font-medium">${janji.tanggalKunjungan}</td>
                    <td class="py-3">${statusHtml}</td>
                    <td class="py-3 text-center">${btnHtml}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat antrean staf:", error);
    }
};

window.accKehadiran = async function(janjiId) {
    try {
        await apiClient.post('/layanan/check-in', { janjiId: janjiId });
        uiManager.showNotif('success', 'Pasien Diterima', 'Antrean telah di-ACC. Pasien masuk daftar periksa dokter.');
        loadDaftarAntreanStaf(); // Reload tabel otomatis
    } catch (error) {
        uiManager.showNotif('error', 'Gagal Proses ACC', error.message);
    }
};

// ==========================================
// ALUR 2: DOKTER (Tampilkan & Periksa Pasien)
// ==========================================
window.currentJanjiId = null;

window.loadPasienDokter = async function(email) {
    try {
        const data = await apiClient.get(`/dokter/antrean-hari-ini?email=${email}`);
        // Mencari kontainer card pasien di halaman dokter
        const container = document.querySelector('.bg-surface-container-lowest .space-y-3.flex-1');
        if (!container) return;

        container.innerHTML = '';
        if(data.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Tidak ada pasien yang menunggu saat ini.</p>';
            return;
        }

        data.forEach(janji => {
            container.innerHTML += `
                <div class="border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center hover:border-primary transition-colors bg-white">
                    <div>
                        <p class="font-bold text-sm">${janji.pasien.namaLengkap}</p>
                        <p class="text-[11px] text-on-surface-variant">No. Antrean: A${janji.nomorAntreanUrut} • Keluhan: ${janji.keluhan || '-'}</p>
                    </div>
                    <button onclick="bukaFormPeriksa('${janji.pasien.namaLengkap}', 'A${janji.nomorAntreanUrut}', ${janji.id})" class="bg-primary/10 text-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">Panggil & Periksa</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat pasien dokter:", error);
    }
};

window.bukaFormPeriksa = function(namaPasien, noAntrean, janjiId) {
    window.currentJanjiId = janjiId;
    document.getElementById('nama-pasien-aktif').textContent = `Memeriksa: ${namaPasien} (Antrean: ${noAntrean})`;
    const formPeriksa = document.getElementById('form-periksa');
    if (formPeriksa) formPeriksa.classList.remove('opacity-50', 'pointer-events-none');
};

window.selesaikanPemeriksaan = async function(event) {
    event.preventDefault(); 
    const diagnosis = document.getElementById('input-diagnosis').value;
    const resep = document.getElementById('input-resep').value;

    try {
        await apiClient.post('/layanan/periksa-selesai', { 
            janjiId: window.currentJanjiId,
            diagnosis: diagnosis,
            resep: resep 
        });
        
        uiManager.showNotif('success', 'Pemeriksaan Selesai', 'Diagnosis & resep berhasil diterbitkan ke rekam medis!');
        
        // Matikan Form & Reload List Pasien
        const formPeriksa = document.getElementById('form-periksa');
        formPeriksa.reset();
        formPeriksa.classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('nama-pasien-aktif').textContent = "Pilih pasien di samping untuk memulai.";
        
        loadPasienDokter(sessionStorage.getItem('userEmail'));
    } catch (error) {
        uiManager.showNotif('error', 'Penyimpanan Gagal', error.message);
    }
};

// ==========================================
// ALUR 3: UMUM & ADMIN
// ==========================================
window.prosesCheckIn = async function(janjiId = 1) { // Fungsi dari pasien.html
    try {
        await apiClient.post('/layanan/check-in', { janjiId: janjiId });
        uiManager.showNotif('success', 'Berhasil', 'Check-in sukses! Tunggu ACC Staf.');
    } catch (error) {
        uiManager.showNotif('error', 'Check-in Gagal', error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formAdmin = document.getElementById('form-tambah-internal');
    if(formAdmin) {
        formAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const role = document.getElementById('input-role').value;
            const nama = document.getElementById('input-nama').value;
            const email = document.getElementById('input-email').value;
            const password = document.getElementById('input-sandi').value;

            try {
                let endpoint = role === 'DOKTER' ? '/admin/add-dokter' : '/admin/add-poli';
                await apiClient.post(endpoint, { nama: nama, email: email, password: password, poliId: "1" }); 
                uiManager.showNotif('success', 'Akun Terdaftar', `Kredensial untuk ${nama} berhasil dibuat.`);
                window.toggleModal('modal-tambah-akun');
                formAdmin.reset();
            } catch(error) {
                uiManager.showNotif('error', 'Pendaftaran Gagal', error.message);
            }
        });
    }
});

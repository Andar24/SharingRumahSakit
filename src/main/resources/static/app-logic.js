import { apiClient } from './api.js';
import { uiManager } from './ui.js';

// ==========================================
// ALUR 1: PASIEN (Proses Check-in)
// ==========================================
window.prosesCheckIn = async function(janjiId = 1) {
    // Pada produksi nyata, janjiId diambil secara dinamis.
    try {
        await apiClient.post('/layanan/check-in', { janjiId: janjiId });
        uiManager.showNotif('success', 'Berhasil', 'Check-in berhasil! Silakan tunggu ACC Staf Poli.');
        
        // Memunculkan teks tunggu ACC di UI
        const statusCheckin = document.getElementById('status-checkin');
        if (statusCheckin) statusCheckin.classList.remove('hidden');
    } catch (error) {
        uiManager.showNotif('error', 'Check-in Gagal', error.message);
    }
};

// ==========================================
// ALUR 2: STAF POLI (ACC Kehadiran Pasien)
// ==========================================
window.accKehadiran = async function(janjiId) {
    try {
        await apiClient.post('/layanan/check-in', { janjiId: janjiId });
        uiManager.showNotif('success', 'Pasien Diterima', `Antrean telah di-ACC. Pasien siap diperiksa dokter.`);
        
        // Perbarui tombol UI secara instan
        const btn = document.getElementById('btn-acc-' + janjiId);
        if(btn) {
            btn.innerHTML = '<span class="material-icons" style="font-size: 14px;">check</span> Selesai ACC';
            btn.classList.replace('bg-green-600', 'bg-gray-500');
            btn.disabled = true;
        }
    } catch (error) {
        uiManager.showNotif('error', 'Gagal Proses ACC', error.message);
    }
};

// ==========================================
// ALUR 3: DOKTER (Pemeriksaan & Resep)
// ==========================================
window.currentJanjiId = null;

// Fungsi ini sudah dipanggil dari tombol 'Panggil & Periksa' di dokter.html
window.bukaFormPeriksa = function(namaPasien, noAntrean, janjiId = 1) {
    window.currentJanjiId = janjiId;
    document.getElementById('nama-pasien-aktif').textContent = `Memeriksa: ${namaPasien} (Antrean: ${noAntrean})`;
    
    // Nyalakan form pemeriksaan
    const formPeriksa = document.getElementById('form-periksa');
    if (formPeriksa) formPeriksa.classList.remove('opacity-50', 'pointer-events-none');
};

// Menangani Submit Form Dokter
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
        
        uiManager.showNotif('success', 'Pemeriksaan Selesai', 'Diagnosis & resep berhasil diterbitkan ke rekam medis pasien!');
        
        // Matikan Form
        const formPeriksa = document.getElementById('form-periksa');
        formPeriksa.reset();
        formPeriksa.classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('nama-pasien-aktif').textContent = "Pilih pasien di samping untuk memulai.";
    } catch (error) {
        uiManager.showNotif('error', 'Penyimpanan Gagal', error.message);
    }
};

// ==========================================
// ALUR 4: ADMIN (Form Tambah Akun)
// ==========================================
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
                // Tentukan endpoint berdasarkan peran yang dipilih
                let endpoint = role === 'DOKTER' ? '/admin/add-dokter' : '/admin/add-poli';
                // Data dummy ID Poli = 1 untuk integrasi cepat
                await apiClient.post(endpoint, { nama: nama, email: email, password: password, poliId: 1 }); 
                
                uiManager.showNotif('success', 'Akun Terdaftar', `Sistem berhasil membuat kredensial login untuk ${nama}`);
                window.toggleModal('modal-tambah-akun');
                formAdmin.reset();
            } catch(error) {
                uiManager.showNotif('error', 'Pendaftaran Gagal', error.message);
            }
        });
    }
});

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
    if (path.includes('/admin')) {
        loadAdminStats();
        loadUserList();
        loadPoliList();
    }
    if (path.includes('/pasien')) {
        updateCurrentDate();
    }
    
    // Update tanggal di semua halaman
    updateCurrentDate();
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
window.prosesCheckIn = async function(janjiId) { 
    if (!janjiId) {
        uiManager.showNotif('error', 'Data Tidak Lengkap', 'ID Janji Temu tidak ditemukan.');
        return;
    }
    
    try {
        await apiClient.post('/layanan/check-in', { janjiId: janjiId });
        uiManager.showNotif('success', 'Berhasil', 'Check-in sukses! Tunggu ACC Staf.');
    } catch (error) {
        uiManager.showNotif('error', 'Check-in Gagal', error.message);
    }
};

// ==========================================
// PASSWORD CHANGE HANDLER (Untuk semua role)
// ==========================================
window.handleChangePassword = async function(event) {
    event.preventDefault();
    const form = event.target;
    const oldPassword = form.querySelector('input[placeholder="Sandi Lama"]').value;
    const newPassword = form.querySelector('input[placeholder="Sandi Baru"]').value;

    if (newPassword.length < 6) {
        uiManager.showNotif('error', 'Password Terlalu Pendek', 'Minimal 6 karakter.');
        return;
    }

    try {
        const userEmail = sessionStorage.getItem('userEmail');
        await apiClient.post('/auth/change-password', {
            email: userEmail,
            oldPassword: oldPassword,
            newPassword: newPassword
        });
        
        uiManager.showNotif('success', 'Berhasil', 'Kata sandi berhasil diperbarui!');
        form.reset();
    } catch (error) {
        uiManager.showNotif('error', 'Gagal Ubah Sandi', error.message || 'Pastikan sandi lama Anda benar.');
    }
};

// ==========================================
// FORM HANDLER: Add Poliklinik Baru
// ==========================================
window.handleAddPoli = async function(event) {
    event.preventDefault();
    const form = event.target;
    const namaPoli = form.querySelector('input[placeholder*="Poli"]').value;
    const kepalaPoli = form.querySelector('select').value;

    try {
        await apiClient.post('/admin/add-poliklinik', {
            namaPoli: namaPoli,
            kepalaPoli: kepalaPoli
        });
        
        uiManager.showNotif('success', 'Poliklinik Ditambahkan', `${namaPoli} berhasil didaftarkan.`);
        form.reset();
    } catch (error) {
        uiManager.showNotif('error', 'Gagal Menambah Poli', error.message);
    }
};

// ==========================================
// FORM HANDLER: Add Artikel Medis
// ==========================================
window.handleAddArtikel = async function(event) {
    event.preventDefault();
    const judul = document.getElementById('artikel-judul').value;
    const konten = document.getElementById('artikel-konten').value;
    const fileInput = document.getElementById('artikel-gambar');

    try {
        // TODO: Implement file upload logic
        await apiClient.post('/admin/add-artikel', {
            judul: judul,
            konten: konten
            // gambar: will be added after file upload implementation
        });
        
        uiManager.showNotif('success', 'Artikel Dipublikasi', `"${judul}" telah dipublikasikan ke halaman publik.`);
        document.getElementById('formAddArtikel').reset();
    } catch (error) {
        uiManager.showNotif('error', 'Gagal Publikasi', error.message);
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
            const poliId = document.getElementById('input-poli-id')?.value;

            if (!poliId && role !== 'DOKTER') {
                uiManager.showNotif('error', 'Data Tidak Lengkap', 'Silakan pilih Poliklinik.');
                return;
            }

            try {
                let endpoint = role === 'DOKTER' ? '/admin/add-dokter' : '/admin/add-poli';
                const payload = { nama: nama, email: email, password: password };
                if (poliId) payload.poliId = poliId;
                
                await apiClient.post(endpoint, payload); 
                uiManager.showNotif('success', 'Akun Terdaftar', `Kredensial untuk ${nama} berhasil dibuat.`);
                window.toggleModal('modal-tambah-akun');
                formAdmin.reset();
            } catch(error) {
                uiManager.showNotif('error', 'Pendaftaran Gagal', error.message);
            }
        });
    }
});

// ==========================================
// PHASE 3: MEDIUM PRIORITY FIXES
// ==========================================

// Import utilities
import { formatTanggalIndonesia, generateResepPDF, generateResepPDFClient } from './utils.js';

// FIX #1: Dashboard Stats Real-Time
window.loadAdminStats = async function() {
    try {
        const stats = await apiClient.get('/admin/dashboard-stats');
        
        const statPasien = document.getElementById('stat-total-pasien');
        const statDokter = document.getElementById('stat-dokter-aktif');
        const statStaf = document.getElementById('stat-staf-poli');
        const statKunjungan = document.getElementById('stat-kunjungan');
        
        if (statPasien) statPasien.textContent = stats.totalPasien || 0;
        if (statDokter) statDokter.textContent = stats.totalDokter || 0;
        if (statStaf) statStaf.textContent = stats.totalStaf || 0;
        if (statKunjungan) statKunjungan.textContent = stats.kunjunganBulanIni || 0;
    } catch (error) {
        console.error('Gagal load stats:', error);
        // Set default values on error
        const statPasien = document.getElementById('stat-total-pasien');
        const statDokter = document.getElementById('stat-dokter-aktif');
        const statStaf = document.getElementById('stat-staf-poli');
        const statKunjungan = document.getElementById('stat-kunjungan');
        
        if (statPasien) statPasien.textContent = '0';
        if (statDokter) statDokter.textContent = '0';
        if (statStaf) statStaf.textContent = '0';
        if (statKunjungan) statKunjungan.textContent = '0';
    }
};

// FIX #2: User Table Dynamic Loading
window.currentFilter = 'ALL';

window.loadUserList = async function(filterRole = 'ALL') {
    try {
        let endpoint = '/admin/list-users';
        if (filterRole !== 'ALL') {
            endpoint += `?role=${filterRole}`;
        }
        
        const users = await apiClient.get(endpoint);
        const tbody = document.getElementById('tbody-user-list');
        
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">Tidak ada data pengguna</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const roleClass = user.role === 'DOKTER' ? 'badge-dokter' : 
                            user.role === 'PASIEN' ? 'badge-pasien' : 'badge-staf';
            const roleIcon = user.role === 'DOKTER' ? 'medical_services' : 
                           user.role === 'PASIEN' ? 'personal_injury' : 'support_agent';
            
            tbody.innerHTML += `
                <tr class="hover:bg-surface/50 transition-colors">
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&background=004ac6&color=fff" class="w-9 h-9 rounded-full">
                            <div>
                                <p class="font-bold text-on-surface">${user.nama}</p>
                                <p class="text-[11px] text-on-surface-variant">${user.email}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="${roleClass} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1">
                            <span class="material-icons" style="font-size: 12px;">${roleIcon}</span> ${user.role}
                        </span>
                    </td>
                    <td class="py-3 px-4"><p class="text-xs font-semibold">${user.detail || '-'}</p></td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-1.5">
                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                            <span class="text-xs font-semibold text-green-700">Aktif</span>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="editUser(${user.id})" class="text-primary hover:bg-primary-fixed p-1.5 rounded transition">
                            <span class="material-icons" style="font-size: 18px;">edit</span>
                        </button>
                        <button onclick="blockUser(${user.id}, '${user.nama}')" class="text-error hover:bg-red-50 p-1.5 rounded transition">
                            <span class="material-icons" style="font-size: 18px;">block</span>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Gagal memuat user list:', error);
    }
};

// FIX #3: Filter Users by Role
window.filterUsers = async function(filterType) {
    window.currentFilter = filterType;
    
    // Update UI button active state
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('bg-white', 'shadow-sm', 'font-bold', 'text-primary');
        btn.classList.add('font-semibold', 'text-on-surface-variant');
    });
    
    const activeBtn = document.getElementById(`filter-${filterType.toLowerCase()}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'shadow-sm', 'font-bold', 'text-primary');
        activeBtn.classList.remove('font-semibold', 'text-on-surface-variant');
    }
    
    // Reload list with filter
    await loadUserList(filterType);
};

// FIX #4: Search Users
window.searchUsers = function(searchTerm) {
    const rows = document.querySelectorAll('#tbody-user-list tr');
    const searchLower = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchLower)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

// FIX #5: Edit User (placeholder for future implementation)
window.editUser = function(userId) {
    uiManager.showNotif('info', 'Fitur Edit User', 'Fitur edit user akan segera hadir!');
    // TODO: Implement edit user modal
};

// FIX #6: Block/Unblock User
window.blockUser = async function(userId, userName) {
    const confirmed = await uiManager.confirm(
        'Blokir Pengguna', 
        `Apakah Anda yakin ingin memblokir ${userName}?`
    );
    
    if (confirmed) {
        try {
            await apiClient.post(`/admin/block-user/${userId}`);
            uiManager.showNotif('success', 'Berhasil', `${userName} telah diblokir`);
            loadUserList(window.currentFilter);
        } catch (error) {
            uiManager.showNotif('error', 'Gagal', error.message);
        }
    }
};

// FIX #7: Load Poliklinik List
window.loadPoliList = async function() {
    try {
        const poliList = await apiClient.get('/admin/list-poliklinik');
        const container = document.querySelector('#poli-list-container');
        
        if (!container) return;
        container.innerHTML = '';
        
        if (poliList.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Belum ada poliklinik terdaftar</p>';
            return;
        }
        
        poliList.forEach(poli => {
            container.innerHTML += `
                <div class="border border-outline-variant/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary transition">
                    <div>
                        <h3 class="font-bold text-primary">${poli.namaPoli}</h3>
                        <p class="text-xs text-on-surface-variant">Kepala: ${poli.kepalaPoli || 'Belum ditentukan'}</p>
                    </div>
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">Aktif</span>
                </div>
            `;
        });
    } catch (error) {
        console.error('Gagal load poli list:', error);
    }
};

// FIX #8: Update Current Date
window.updateCurrentDate = function() {
    const dateElements = document.querySelectorAll('#tanggal-hari-ini');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('id-ID', options);
    
    dateElements.forEach(el => {
        el.textContent = dateString;
    });
};

// FIX #9: Booking Modal for Pasien
window.bukaModalBooking = async function() {
    try {
        const poliList = await apiClient.get('/pasien/list-poli');
        
        const modalHTML = `
            <div id="modal-booking" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                    <button onclick="tutupModalBooking()" class="absolute top-4 right-4 text-gray-400 hover:text-error">
                        <span class="material-icons">close</span>
                    </button>
                    
                    <h2 class="text-2xl font-bold mb-2 flex items-center gap-2">
                        <span class="material-icons text-primary">event_available</span>
                        Buat Janji Temu Baru
                    </h2>
                    <p class="text-sm text-gray-500 mb-6">Pilih poliklinik, dokter, dan tanggal kunjungan Anda</p>
                    
                    <form id="form-booking" onsubmit="submitBooking(event)" class="space-y-4">
                        <div>
                            <label class="text-xs font-bold text-gray-600 uppercase block mb-2">Poliklinik</label>
                            <select id="select-poli" class="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required>
                                <option value="">Pilih Poliklinik</option>
                                ${poliList.map(p => `<option value="${p.id}">${p.namaPoli}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="text-xs font-bold text-gray-600 uppercase block mb-2">Jadwal Dokter</label>
                            <select id="select-jadwal" class="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required>
                                <option value="">Pilih dokter terlebih dahulu</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="text-xs font-bold text-gray-600 uppercase block mb-2">Tanggal Kunjungan</label>
                            <input type="date" id="input-tanggal" class="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required>
                        </div>
                        
                        <div>
                            <label class="text-xs font-bold text-gray-600 uppercase block mb-2">Keluhan (Opsional)</label>
                            <textarea id="input-keluhan" rows="3" class="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Jelaskan keluhan Anda..."></textarea>
                        </div>
                        
                        <button type="submit" class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                            <span class="material-icons">check_circle</span>
                            Buat Booking Sekarang
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Set min date to today
        const dateInput = document.getElementById('input-tanggal');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        // Load jadwal dokter when poli selected
        document.getElementById('select-poli').addEventListener('change', async (e) => {
            const poliId = e.target.value;
            if (!poliId) {
                document.getElementById('select-jadwal').innerHTML = '<option value="">Pilih dokter terlebih dahulu</option>';
                return;
            }
            
            try {
                const jadwalList = await apiClient.get(`/pasien/jadwal-dokter/${poliId}`);
                const selectJadwal = document.getElementById('select-jadwal');
                
                if (jadwalList.length === 0) {
                    selectJadwal.innerHTML = '<option value="">Tidak ada jadwal tersedia</option>';
                    return;
                }
                
                selectJadwal.innerHTML = '<option value="">Pilih Jadwal Dokter</option>' + 
                    jadwalList.map(j => 
                        `<option value="${j.id}">${j.dokter.namaLengkap} - ${j.hari} (${j.jamMulai}-${j.jamSelesai})</option>`
                    ).join('');
            } catch (error) {
                uiManager.showNotif('error', 'Gagal', 'Tidak dapat memuat jadwal dokter');
            }
        });
        
    } catch (error) {
        uiManager.showNotif('error', 'Gagal', error.message);
    }
};

window.tutupModalBooking = function() {
    const modal = document.getElementById('modal-booking');
    if (modal) modal.remove();
};

window.submitBooking = async function(event) {
    event.preventDefault();
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const jadwalId = document.getElementById('select-jadwal').value;
    const tanggal = document.getElementById('input-tanggal').value;
    const keluhan = document.getElementById('input-keluhan').value;
    
    try {
        const response = await apiClient.post('/pasien/booking', {
            pasienId: userData.userId,
            jadwalId: jadwalId,
            tanggalKunjungan: tanggal,
            keluhan: keluhan
        });
        
        uiManager.showNotif('success', 'Booking Berhasil!', 
            `Kode Tiket: ${response.kodeTiket}. Nomor Antrean: A${response.nomorAntrean}`);
        
        // Save janjiId for check-in later
        userData.currentJanjiId = response.janjiId;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        tutupModalBooking();
        
        // Refresh dashboard if needed
        if (typeof loadPasienDashboard === 'function') {
            loadPasienDashboard();
        }
    } catch (error) {
        uiManager.showNotif('error', 'Booking Gagal', error.message);
    }
};

// FIX #10: Load Riwayat Pasien
window.loadRiwayatPasien = async function(pasienId) {
    try {
        const riwayat = await apiClient.get(`/pasien/riwayat/${pasienId}`);
        const tbody = document.getElementById('tabel-riwayat-pasien');
        
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (riwayat.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">Belum ada riwayat pemeriksaan</td></tr>';
            return;
        }
        
        riwayat.forEach(janji => {
            // Format tanggal dengan utility function
            const tanggalFormatted = formatTanggalIndonesia(janji.tanggalKunjungan, 'date');
            
            tbody.innerHTML += `
                <tr class="border-b border-outline-variant/10 hover:bg-gray-50">
                    <td class="py-3">${tanggalFormatted}</td>
                    <td class="py-3">
                        <p class="font-bold">${janji.dokter.namaLengkap}</p>
                        <p class="text-xs text-gray-500">${janji.poliklinik?.namaPoli || 'Umum'}</p>
                    </td>
                    <td class="py-3">
                        <p class="text-sm">${janji.diagnosis || 'Belum diperiksa'}</p>
                    </td>
                    <td class="py-3 text-center">
                        ${janji.resep ? 
                            `<button onclick="downloadResepPDF(${janji.id}, '${janji.pasien.namaLengkap}', '${janji.dokter.namaLengkap}', '${janji.tanggalKunjungan}', '${encodeURIComponent(janji.diagnosis)}', '${encodeURIComponent(janji.resep)}')" class="text-primary font-bold text-xs hover:underline flex items-center gap-1 mx-auto">
                                <span class="material-icons" style="font-size: 14px;">download</span> Download PDF
                            </button>` 
                            : '<span class="text-gray-400 text-xs">-</span>'
                        }
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Gagal memuat riwayat:', error);
    }
};

// NEW: Download Resep PDF
window.downloadResepPDF = async function(janjiId, pasienNama, dokterNama, tanggal, diagnosis, resep) {
    try {
        const resepData = {
            janjiId: janjiId,
            pasienNama: pasienNama,
            dokterNama: dokterNama,
            tanggal: tanggal,
            diagnosis: decodeURIComponent(diagnosis),
            resep: decodeURIComponent(resep)
        };
        
        // Try backend endpoint first (if available)
        try {
            await generateResepPDF(resepData);
            uiManager.showNotif('success', 'PDF Downloaded', 'Resep berhasil diunduh!');
        } catch (backendError) {
            // Fallback to client-side generation
            console.log('Backend PDF not available, using client-side generation');
            generateResepPDFClient(resepData);
            uiManager.showNotif('success', 'PDF Generated', 'Resep berhasil dibuat!');
        }
    } catch (error) {
        uiManager.showNotif('error', 'Gagal', 'Tidak dapat membuat PDF: ' + error.message);
    }
};

window.lihatResep = function(janjiId) {
    // Deprecated - use downloadResepPDF instead
    uiManager.showNotif('info', 'Resep Dokter', 'Klik tombol "Download PDF" untuk mengunduh resep.');
};

// FIX #11: View Switcher Enhancement with History API
window.switchView = function(viewId, element) {
    // Hide all views
    document.querySelectorAll('.spa-view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    
    // Show selected view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.classList.add('active');
        selectedView.classList.remove('hidden');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    // Update URL with History API (without page reload)
    const viewName = viewId.replace('view-', '');
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}#${viewName}`;
    
    // Push state to browser history
    window.history.pushState(
        { viewId: viewId }, 
        '', 
        newUrl
    );
    
    // Load data based on view
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (viewId === 'view-riwayat' && userData) {
        loadRiwayatPasien(userData.userId);
    }
    if (viewId === 'view-akun') {
        loadUserList(window.currentFilter);
    }
    if (viewId === 'view-ringkasan') {
        loadAdminStats();
    }
    if (viewId === 'view-poli') {
        loadPoliList();
    }
};

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.viewId) {
        // Get view ID from state
        const viewId = event.state.viewId;
        
        // Find the sidebar element for this view
        const sidebarItem = document.querySelector(`[onclick*="${viewId}"]`);
        
        // Switch to the view (without pushing to history again)
        switchViewWithoutHistory(viewId, sidebarItem);
    } else {
        // Handle hash in URL on page load
        const hash = window.location.hash.substring(1); // Remove #
        if (hash) {
            const viewId = `view-${hash}`;
            const sidebarItem = document.querySelector(`[onclick*="${viewId}"]`);
            switchViewWithoutHistory(viewId, sidebarItem);
        }
    }
});

// Switch view without pushing to history (for popstate handler)
function switchViewWithoutHistory(viewId, element) {
    // Hide all views
    document.querySelectorAll('.spa-view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    
    // Show selected view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.classList.add('active');
        selectedView.classList.remove('hidden');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    // Load data based on view
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (viewId === 'view-riwayat' && userData) {
        loadRiwayatPasien(userData.userId);
    }
    if (viewId === 'view-akun') {
        loadUserList(window.currentFilter);
    }
    if (viewId === 'view-ringkasan') {
        loadAdminStats();
    }
    if (viewId === 'view-poli') {
        loadPoliList();
    }
}

// Handle initial page load with hash
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const viewId = `view-${hash}`;
        const sidebarItem = document.querySelector(`[onclick*="${viewId}"]`);
        if (sidebarItem) {
            switchViewWithoutHistory(viewId, sidebarItem);
        }
    }
});

// FIX #12: Modal Toggle Enhancement
window.toggleModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (modal.classList.contains('hidden') || !modal.classList.contains('flex')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Load data when modal opens
        if (modalId === 'modal-tambah-akun') {
            loadPoliOptionsForModal();
        }
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.loadPoliOptionsForModal = async function() {
    try {
        const poliList = await apiClient.get('/admin/list-poliklinik');
        const select = document.getElementById('input-poli-id');
        if (select) {
            select.innerHTML = '<option value="">Pilih Poliklinik</option>' +
                poliList.map(p => `<option value="${p.id}">${p.namaPoli}</option>`).join('');
        }
    } catch (error) {
        console.error('Gagal load poli options:', error);
    }
};

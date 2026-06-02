function navigateTo(pageId, pushState = true) {
    document.querySelectorAll('.spa-page').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushState) history.pushState({ page: pageId }, "", "#" + pageId);

    if (pageId === 'view-dashboard-pasien') loadDashboardPasien();
    if (pageId === 'view-cari-dokter') loadBookingData();
    if (pageId === 'view-dashboard-admin') loadAdminData();
}

function toggleAuth(view) {
    document.getElementById('login-container').style.display = view === 'login' ? 'block' : 'none';
    document.getElementById('register-container').style.display = view === 'register' ? 'block' : 'none';
    document.getElementById('forgot-container').style.display = view === 'forgot' ? 'block' : 'none';
}

window.addEventListener('popstate', e => e.state && e.state.page ? navigateTo(e.state.page, false) : navigateTo('view-beranda', false));

function logout() {
    if(confirm("Log keluar dari sistem?")) {
        sessionStorage.clear();
        document.getElementById('loginFormAPI')?.reset();
        navigateTo('view-auth');
    }
}

async function postData(url, data) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Terjadi kesalahan jaringan');
    return result;
}

// --- 1. AUTH ---
document.getElementById('loginFormAPI')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn'); btn.innerHTML = "Memproses...";
    try {
        const data = await postData('/api/login', { email: document.getElementById('login-email').value, password: document.getElementById('login-password').value });
        sessionStorage.setItem('userEmail', data.email); sessionStorage.setItem('userNama', data.nama);
        if (data.role === 'ADMIN') navigateTo('view-dashboard-admin');
        else if (data.role === 'DOKTER') navigateTo('view-dashboard-dokter');
        else if (data.role === 'POLI') navigateTo('view-dashboard-poli');
        else navigateTo('view-dashboard-pasien');
    } catch (err) { alert("Gagal Login: " + err.message); }
    finally { btn.innerHTML = `Masuk Ke Akun <span class="material-symbols-outlined text-[24px]">arrow_forward</span>`; }
});

document.getElementById('registerFormAPI')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await postData('/api/register', { nama: document.getElementById('reg-name').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value, nik: document.getElementById('reg-nik').value, tanggalLahir: document.getElementById('reg-dob').value, jenisKelamin: document.getElementById('reg-gender').value, golonganDarah: document.getElementById('reg-blood').value });
        alert("Pendaftaran berhasil! Silakan masuk."); toggleAuth('login'); e.target.reset();
    } catch (err) { alert(err.message); }
});

// --- 2. ADMIN & DOKTER ---
async function loadAdminData() {
    try {
        const res = await fetch('/api/admin/list-poliklinik');
        if(res.ok) {
            const polis = await res.json();
            const sel = document.getElementById('new-dokter-poli');
            if(sel) { sel.innerHTML = '<option value="">-- Pilih Poliklinik --</option>'; polis.forEach(p => sel.innerHTML += `<option value="${p.id}">${p.namaPoli}</option>`); }
        }
    } catch(e){}
}

document.getElementById('formAddPoliMaster')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await postData('/api/admin/add-poliklinik', { namaPoli: document.getElementById('new-poli-master-nama').value, lokasi: document.getElementById('new-poli-master-ruang').value }); alert("Poliklinik berhasil dibuat!"); e.target.reset(); loadAdminData(); } catch (err) { alert(err.message); }
});

document.getElementById('formAddDokter')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await postData('/api/admin/add-dokter', { poliId: document.getElementById('new-dokter-poli').value, nama: document.getElementById('new-dokter-nama').value, email: document.getElementById('new-dokter-email').value, password: document.getElementById('new-dokter-pass').value }); alert("Dokter berhasil didaftarkan!"); e.target.reset(); } catch (err) { alert(err.message); }
});

document.getElementById('formAddJadwal')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await postData('/api/dokter/add-jadwal', { email: sessionStorage.getItem('userEmail'), hari: document.getElementById('jadwal-hari').value, jamMulai: document.getElementById('jadwal-mulai').value, jamSelesai: document.getElementById('jadwal-selesai').value, kuota: document.getElementById('jadwal-kuota').value }); alert("Jadwal Praktik berhasil diterbitkan!"); e.target.reset(); } catch (err) { alert(err.message); }
});

// --- 3. PASIEN & KELUARGA ---
async function loadDashboardPasien() {
    const email = sessionStorage.getItem('userEmail'); if(!email) return;
    try {
        const res = await fetch(`/api/pasien/list-keluarga?emailParent=${email}`);
        if(res.ok) {
            const data = await res.json();
            const listUI = document.getElementById('list-keluarga-ui');
            if(listUI) { listUI.innerHTML = ''; data.forEach(p => listUI.innerHTML += `<li class="bg-blue-50 p-4 rounded-xl border border-blue-100 font-bold text-blue-900">${p.nama} (Umur ${p.umur} Thn)</li>`); }
        }
    } catch(e){}
}

document.getElementById('formTambahKeluarga')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await postData('/api/pasien/add-keluarga', { emailParent: sessionStorage.getItem('userEmail'), namaLengkap: document.getElementById('fam-name').value, nik: document.getElementById('fam-nik').value, tanggalLahir: document.getElementById('fam-dob').value, jenisKelamin: document.getElementById('fam-gender').value, golonganDarah: document.getElementById('fam-blood').value }); alert("Anggota Keluarga berhasil ditambahkan!"); e.target.reset(); loadDashboardPasien(); } catch (err) { alert(err.message); }
});

// --- 4. BOOKING ANTREAN ---
async function loadBookingData() {
    const email = sessionStorage.getItem('userEmail');
    if(!email) { alert("Silakan Login terlebih dahulu untuk mengambil antrean."); navigateTo('view-auth'); return; }
    try {
        const resKeluarga = await fetch(`/api/pasien/list-keluarga?emailParent=${email}`);
        if(resKeluarga.ok) {
            const selPasien = document.getElementById('booking-pasien'); selPasien.innerHTML = '';
            (await resKeluarga.json()).forEach(p => selPasien.innerHTML += `<option value="${p.id}">${p.nama} (Umur ${p.umur} thn)</option>`);
        }
        const resPoli = await fetch('/api/pasien/list-poli');
        if(resPoli.ok) {
            const selPoli = document.getElementById('booking-poli'); selPoli.innerHTML = '<option value="">-- Pilih Poliklinik --</option>';
            (await resPoli.json()).forEach(p => selPoli.innerHTML += `<option value="${p.id}">${p.namaPoli}</option>`);
        }
    } catch(e){}
}

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

// --- CHANGE PASSWORD ---
async function handleChangePassword(e, oldPassId, newPassId) {
    e.preventDefault();
    try { await postData('/api/change-password', { email: sessionStorage.getItem('userEmail'), oldPassword: document.getElementById(oldPassId).value, newPassword: document.getElementById(newPassId).value }); alert("Kata sandi berhasil diubah!"); e.target.reset(); } catch (err) { alert(err.message); }
}
document.getElementById('formChangePassDokter')?.addEventListener('submit', (e) => handleChangePassword(e, 'dokter-old-pass', 'dokter-new-pass'));
document.getElementById('formChangePassPasien')?.addEventListener('submit', (e) => handleChangePassword(e, 'pasien-old-pass', 'pasien-new-pass'));
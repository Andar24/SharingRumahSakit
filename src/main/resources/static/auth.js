import { apiClient } from './api.js';
import { uiManager } from './ui.js';
import { router } from './router.js';

export const auth = {
    initEvents() {
        const loginForm = document.getElementById('loginFormAPI');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const btnId = 'login-btn';
        uiManager.toggleLoading(btnId, true, 'Masuk');

        try {
            const payload = {
                email: uiManager.getInputValue('login-email'),
                password: uiManager.getInputValue('login-password')
            };

            // PERBAIKAN: Menyesuaikan path dengan @RequestMapping("/api/auth") di Java
            const res = await apiClient.post('/auth/login', payload);

            sessionStorage.setItem('userEmail', res.email);
            sessionStorage.setItem('userNama', res.nama);
            sessionStorage.setItem('userRole', res.role);
            if(res.token) sessionStorage.setItem('authToken', res.token);

            uiManager.showNotif('success', 'Berhasil', `Selamat datang, ${res.nama}!`);
            
            // Jeda 1.5 detik agar animasi sweetalert terlihat
            setTimeout(() => {
                this.redirectByRole(res.role);
            }, 1500);

        } catch (error) {
            uiManager.showNotif('error', 'Gagal Masuk', error.message);
        } finally {
            uiManager.toggleLoading(btnId, false, 'Masuk');
        }
    },

    redirectByRole(role) {
        if (!role) return;
        const r = role.toUpperCase(); // Memaksa semua huruf menjadi Kapital (PASIEN, DOKTER, PEGAWAI_POLI, ADMIN)
        
        if (r === 'ADMIN') window.location.href = '/admin';
        else if (r === 'DOKTER') window.location.href = '/dokter';
        else if (r === 'PEGAWAI_POLI' || r === 'POLI') window.location.href = '/staf-poli';
        else window.location.href = '/pasien';
    }
};

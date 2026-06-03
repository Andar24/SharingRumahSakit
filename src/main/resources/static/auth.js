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

            // Mengirim request ke Backend
            const res = await apiClient.post('/login', payload);

            // Simpan data sesi (Session Storage)
            sessionStorage.setItem('userEmail', res.email);
            sessionStorage.setItem('userNama', res.nama);
            sessionStorage.setItem('userRole', res.role);
            if(res.token) sessionStorage.setItem('authToken', res.token); // Jika backend sudah pakai JWT

            uiManager.showNotif('success', 'Berhasil', `Selamat datang, ${res.nama}!`);
            this.redirectByRole(res.role);

        } catch (error) {
            uiManager.showNotif('error', 'Gagal Masuk', error.message);
        } finally {
            uiManager.toggleLoading(btnId, false, 'Masuk');
        }
    },

    redirectByRole(role) {
        if (role === 'ADMIN') window.location.href = '/admin';
        else if (role === 'DOKTER') window.location.href = '/dokter';
        else if (role === 'POLI') window.location.href = '/staf-poli';
        else window.location.href = '/pasien'; // Default ke halaman pasien
    }
};
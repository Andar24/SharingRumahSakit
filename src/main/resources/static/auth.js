import { apiClient } from './api.js';
import { uiManager } from './ui.js';
import { router } from './router.js';

export const auth = {
    initEvents() {
        const loginForm = document.getElementById('loginFormAPI');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('registerFormAPI');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Email validation on blur
        const emailInput = document.getElementById('register-email');
        if (emailInput) {
            emailInput.addEventListener('blur', async (e) => {
                const email = e.target.value.trim();
                if (email) {
                    try {
                        const res = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
                        if (res.exists) {
                            uiManager.showNotif('warning', 'Email Sudah Terdaftar', 'Silakan gunakan email lain atau login.');
                        }
                    } catch (error) {
                        console.error('Email check error:', error);
                    }
                }
            });
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

            // Simpan ke localStorage untuk persistensi token
            localStorage.setItem('userData', JSON.stringify({
                token: res.token,
                email: res.email,
                nama: res.nama,
                role: res.role,
                userId: res.userId
            }));

            // Tetap simpan ke sessionStorage untuk backward compatibility
            sessionStorage.setItem('userEmail', res.email);
            sessionStorage.setItem('userNama', res.nama);
            sessionStorage.setItem('userRole', res.role);
            sessionStorage.setItem('authToken', res.token);

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

    async handleRegister(e) {
        e.preventDefault();
        const btnId = 'register-btn';
        uiManager.toggleLoading(btnId, true, 'Daftar');

        try {
            const payload = {
                namaLengkap: uiManager.getInputValue('register-nama'),
                email: uiManager.getInputValue('register-email'),
                password: uiManager.getInputValue('register-password'),
                nomorTelepon: uiManager.getInputValue('register-telepon'),
                alamat: uiManager.getInputValue('register-alamat')
            };

            // Validasi password confirmation
            const passwordConfirm = uiManager.getInputValue('register-password-confirm');
            if (payload.password !== passwordConfirm) {
                uiManager.showNotif('error', 'Password Tidak Cocok', 'Pastikan kedua password sama.');
                return;
            }

            const res = await apiClient.post('/auth/register', payload);

            // Auto-login setelah registrasi berhasil
            localStorage.setItem('userData', JSON.stringify({
                token: res.token,
                email: res.email,
                nama: res.nama,
                role: res.role,
                userId: res.userId
            }));

            sessionStorage.setItem('userEmail', res.email);
            sessionStorage.setItem('userNama', res.nama);
            sessionStorage.setItem('userRole', res.role);
            sessionStorage.setItem('authToken', res.token);

            uiManager.showNotif('success', 'Pendaftaran Berhasil', `Selamat datang, ${res.nama}!`);
            
            setTimeout(() => {
                this.redirectByRole(res.role);
            }, 1500);

        } catch (error) {
            uiManager.showNotif('error', 'Pendaftaran Gagal', error.message);
        } finally {
            uiManager.toggleLoading(btnId, false, 'Daftar');
        }
    },

    logout() {
        // Hapus semua data sesi
        localStorage.removeItem('userData');
        sessionStorage.clear();
        
        // Redirect ke halaman login
        window.location.href = '/';
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

// Fungsi logout global yang bisa dipanggil dari mana saja
window.logout = function() {
    auth.logout();
};

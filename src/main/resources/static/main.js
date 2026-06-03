import { router } from './router.js';
import { auth } from './auth.js';
import { uiManager } from './ui.js';

// MENGIMPOR LOGIKA KERJA YANG BARU DIBUAT
import './app-logic.js'; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Navigasi dan Auth
    router.init();
    auth.initEvents();

    // 2. Tampilkan Tanggal Hari Ini (jika ada elemennya di halaman)
    const tanggalEl = document.getElementById('tanggal-hari-ini');
    if (tanggalEl) {
        tanggalEl.textContent = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // 3. JEMBATAN UNTUK ATRIBUT HTML: onclick="switchView(...)"
    window.switchView = function(targetViewId, clickedElement) {
        document.querySelectorAll('.spa-view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.classList.remove('hidden');
        }

        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
        if(clickedElement) clickedElement.classList.add('active');
    };

    // 4. JEMBATAN UNTUK ATRIBUT HTML: onclick="toggleModal(...)"
    window.toggleModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.toggle('active');
    };

    // 5. JEMBATAN UNTUK ATRIBUT HTML: onclick="navigateTo(...)"
    window.navigateTo = function(pageId) {
        router.navigateTo(pageId);
    };
});

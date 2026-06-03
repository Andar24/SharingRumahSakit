export const router = {
    init() {
        // Cek URL saat ini untuk memuat halaman yang tepat saat pertama kali dibuka, default: 'beranda'
        const initialPage = window.location.hash.replace('#', '') || 'beranda';
        this.navigateTo(initialPage, false);

        // Dengarkan tombol 'back' atau 'forward' pada browser
        window.addEventListener('popstate', (e) => {
            const page = e.state ? e.state.page : 'beranda';
            this.navigateTo(page, false);
        });
    },

    navigateTo(pageId, pushState = true) {
        // 1. Sembunyikan semua elemen dengan class 'spa-page'
        document.querySelectorAll('.spa-page').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });

        // 2. Tampilkan halaman tujuan
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
        } else {
            console.warn(`Halaman dengan ID ${pageId} tidak ditemukan.`);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 3. Simpan riwayat navigasi (agar tombol back browser berfungsi)
        if (pushState) {
            history.pushState({ page: pageId }, "", `#${pageId}`);
        }
    }
};
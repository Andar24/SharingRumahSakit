export const uiManager = {
    showNotif(tipe, judul, pesan) {
        // Pastikan library SweetAlert2 (Swal) sudah dipanggil di HTML via CDN/Lokal
        Swal.fire({
            icon: tipe,
            title: judul,
            text: pesan,
            confirmButtonColor: '#004ac6',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3'
            }
        });
    },

    toggleLoading(buttonId, isLoad, originalText = 'Simpan') {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = isLoad;
            btn.innerHTML = isLoad ? `<span class="animate-pulse">Memproses...</span>` : originalText;
        }
    },

    getInputValue(inputId) {
        const el = document.getElementById(inputId);
        return el ? el.value.trim() : '';
    }
};
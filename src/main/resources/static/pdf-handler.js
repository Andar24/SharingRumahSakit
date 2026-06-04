/**
 * PDF Handler Module
 * Modul untuk handle download dan preview PDF resep dokter
 */

const BASE_URL = `${window.location.origin}/api`;

export const PdfHandler = {
    /**
     * Generate dan download PDF resep
     * @param {Object} resepData - Data resep dokter
     */
    async downloadResep(resepData) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${BASE_URL}/resep/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(resepData)
            });

            if (!response.ok) {
                throw new Error('Gagal menggenerate PDF');
            }

            // Convert response ke blob
            const blob = await response.blob();
            
            // Buat URL untuk blob
            const url = window.URL.createObjectURL(blob);
            
            // Buat element anchor untuk trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `Resep_${resepData.namaPasien.replace(/ /g, '_')}_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    },

    /**
     * Preview PDF di tab baru
     * @param {Object} resepData - Data resep dokter
     */
    async previewResep(resepData) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${BASE_URL}/resep/preview-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(resepData)
            });

            if (!response.ok) {
                throw new Error('Gagal menggenerate PDF preview');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Buka di tab baru
            window.open(url, '_blank');
            
            // Cleanup setelah beberapa detik
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
            
            return true;
        } catch (error) {
            console.error('Error previewing PDF:', error);
            throw error;
        }
    },

    /**
     * Get auth token dari localStorage
     */
    getAuthToken() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            return parsed.token;
        }
        return null;
    },

    /**
     * Contoh format data resep yang benar
     */
    getExampleResepData() {
        return {
            namaPasien: "John Doe",
            nomorRekamMedis: "RM-2024-001",
            namaDokter: "Dr. Jane Smith",
            spesialisasi: "Dokter Umum",
            tanggalPemeriksaan: "2024-01-15",  // Format: YYYY-MM-DD
            diagnosis: "Infeksi saluran pernapasan akut (ISPA)",
            daftarObat: [
                {
                    namaObat: "Amoxicillin",
                    dosis: "500 mg",
                    frekuensi: "3x sehari",
                    durasi: "7 hari"
                },
                {
                    namaObat: "Paracetamol",
                    dosis: "500 mg",
                    frekuensi: "3x sehari",
                    durasi: "5 hari"
                }
            ],
            catatanTambahan: "Minum obat setelah makan. Perbanyak minum air putih dan istirahat yang cukup."
        };
    }
};

// Expose ke window untuk akses global
window.PdfHandler = PdfHandler;

/**
 * CARA PENGGUNAAN:
 * 
 * 1. Download PDF:
 *    await PdfHandler.downloadResep(dataResep);
 * 
 * 2. Preview PDF di tab baru:
 *    await PdfHandler.previewResep(dataResep);
 * 
 * 3. Contoh implementasi di UI:
 *    
 *    <button onclick="cetakResep()">Cetak Resep</button>
 *    
 *    async function cetakResep() {
 *        const resepData = {
 *            namaPasien: "John Doe",
 *            nomorRekamMedis: "RM-2024-001",
 *            namaDokter: "Dr. Jane Smith",
 *            spesialisasi: "Dokter Umum",
 *            tanggalPemeriksaan: "2024-01-15",
 *            diagnosis: "ISPA",
 *            daftarObat: [
 *                {
 *                    namaObat: "Amoxicillin",
 *                    dosis: "500 mg",
 *                    frekuensi: "3x sehari",
 *                    durasi: "7 hari"
 *                }
 *            ],
 *            catatanTambahan: "Minum obat setelah makan"
 *        };
 *        
 *        try {
 *            await PdfHandler.downloadResep(resepData);
 *            alert('Resep berhasil diunduh!');
 *        } catch (error) {
 *            alert('Gagal mengunduh resep: ' + error.message);
 *        }
 *    }
 */

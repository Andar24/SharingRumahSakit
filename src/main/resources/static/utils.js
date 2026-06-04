// ==========================================
// UTILITY FUNCTIONS - CarePulse
// ==========================================

/**
 * Format timestamp dari database ke format Indonesia
 * @param {string} timestamp - Format: "2024-05-20T10:30:00" atau "2024-05-20"
 * @param {string} format - "full", "date", "time", "datetime"
 * @returns {string} - Format Indonesia
 */
export function formatTanggalIndonesia(timestamp, format = 'full') {
    if (!timestamp) return '-';
    
    const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const hariIndo = [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    
    let date;
    
    // Handle different input formats
    if (timestamp.includes('T')) {
        // ISO format: "2024-05-20T10:30:00"
        date = new Date(timestamp);
    } else if (timestamp.includes('-')) {
        // Date only: "2024-05-20"
        date = new Date(timestamp + 'T00:00:00');
    } else {
        date = new Date(timestamp);
    }
    
    // Validate date
    if (isNaN(date.getTime())) return timestamp;
    
    const hari = hariIndo[date.getDay()];
    const tanggal = date.getDate();
    const bulan = bulanIndo[date.getMonth()];
    const tahun = date.getFullYear();
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'full':
            // "Senin, 20 Mei 2024, 10:30 WIB"
            return `${hari}, ${tanggal} ${bulan} ${tahun}, ${jam}:${menit} WIB`;
        
        case 'date':
            // "20 Mei 2024"
            return `${tanggal} ${bulan} ${tahun}`;
        
        case 'datetime':
            // "20 Mei 2024, 10:30"
            return `${tanggal} ${bulan} ${tahun}, ${jam}:${menit}`;
        
        case 'time':
            // "10:30 WIB"
            return `${jam}:${menit} WIB`;
        
        case 'short':
            // "20/05/2024"
            const bulanNum = String(date.getMonth() + 1).padStart(2, '0');
            return `${String(tanggal).padStart(2, '0')}/${bulanNum}/${tahun}`;
        
        default:
            return `${tanggal} ${bulan} ${tahun}`;
    }
}

/**
 * Get relative time (5 menit yang lalu, 2 hari yang lalu)
 * @param {string} timestamp 
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    
    return formatTanggalIndonesia(timestamp, 'date');
}

/**
 * Generate PDF Resep Dokter
 * @param {Object} resepData - Data resep dari database
 */
export async function generateResepPDF(resepData) {
    // Gunakan backend endpoint yang sudah ada
    try {
        const response = await fetch('/api/resep/download-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(resepData)
        });
        
        if (!response.ok) {
            throw new Error('Gagal generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Resep_${resepData.pasienNama}_${resepData.tanggal || 'now'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

/**
 * Generate PDF Resep menggunakan jsPDF (client-side alternative)
 * Gunakan jika backend endpoint tidak tersedia
 */
export function generateResepPDFClient(resepData) {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library not loaded. Add: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RESEP DOKTER', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rumah Sakit CarePulse', 105, 28, { align: 'center' });
    doc.text('Jl. Kesehatan No. 123, Jakarta', 105, 34, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Patient Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    let y = 50;
    
    doc.text('Informasi Pasien:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`Nama: ${resepData.pasienNama || '-'}`, 20, y);
    y += 6;
    doc.text(`Tanggal: ${formatTanggalIndonesia(resepData.tanggal, 'date')}`, 20, y);
    y += 6;
    doc.text(`Dokter: ${resepData.dokterNama || '-'}`, 20, y);
    
    // Diagnosis
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    
    const diagnosisLines = doc.splitTextToSize(resepData.diagnosis || '-', 170);
    diagnosisLines.forEach(line => {
        doc.text(line, 20, y);
        y += 6;
    });
    
    // Resep Obat
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Resep Obat:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    
    const resepLines = doc.splitTextToSize(resepData.resep || '-', 170);
    resepLines.forEach(line => {
        doc.text(line, 20, y);
        y += 6;
    });
    
    // Notes
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Catatan: Gunakan obat sesuai anjuran dokter', 20, y);
    
    // Footer - Signature
    y = 250;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Dokter Pemeriksa,', 140, y);
    y += 15;
    doc.text(`(${resepData.dokterNama || 'Dr. ....'})`, 140, y);
    
    // Save PDF
    const fileName = `Resep_${resepData.pasienNama}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
}

/**
 * Helper: Get auth token from localStorage
 */
function getAuthToken() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.token;
    }
    return null;
}

/**
 * Format currency to IDR
 * @param {number} amount 
 * @returns {string} - "Rp 150.000"
 */
export function formatRupiah(amount) {
    if (!amount) return 'Rp 0';
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Generate random color for avatar
 * @param {string} name 
 * @returns {string} - Hex color
 */
export function getAvatarColor(name) {
    const colors = [
        '#004ac6', '#1976d2', '#0288d1', '#0097a7', '#00796b',
        '#388e3c', '#689f38', '#afb42b', '#f57c00', '#e64a19'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Export all utilities
export default {
    formatTanggalIndonesia,
    formatRelativeTime,
    generateResepPDF,
    generateResepPDFClient,
    formatRupiah,
    isValidEmail,
    getAvatarColor
};

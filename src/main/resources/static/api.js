const BASE_URL = '/api';

export const apiClient = {
    // Fungsi untuk menyisipkan header (termasuk token keamanan jika nanti ada)
    getHeaders() {
        const token = sessionStorage.getItem('authToken'); // Persiapan untuk JWT Backend
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    },

    async post(endpoint, data) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    },

    async get(endpoint) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async handleResponse(response) {
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Terjadi kesalahan pada peladen.');
        }
        return result;
    }
};
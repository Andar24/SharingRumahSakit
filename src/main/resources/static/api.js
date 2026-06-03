// Menggunakan URL dinamis berbasis lokasi domain browser aktif
const BASE_URL = `${window.location.origin}/api`;

const ApiService = {
    async post(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`API Post Error pada ${endpoint}:`, error);
            return { status: 'error', message: 'Gagal terhubung ke server database.' };
        }
    },

    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error(`API Get Error pada ${endpoint}:`, error);
            return null;
        }
    }
};

window.ApiService = ApiService;

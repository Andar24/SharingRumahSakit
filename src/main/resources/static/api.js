const BASE_URL = `${window.location.origin}/api`;

export const apiClient = {
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
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || 'Terjadi kesalahan server');
            return resData;
        } catch (error) {
            console.error(`API Post Error:`, error);
            throw error;
        }
    },

    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Gagal mengambil data');
            return await response.json();
        } catch (error) {
            console.error(`API Get Error:`, error);
            throw error;
        }
    }
};

window.ApiService = apiClient;

const BASE_URL = `${window.location.origin}/api`;

// Loading Spinner Management
const LoadingSpinner = {
    element: null,
    
    init() {
        if (!this.element) {
            // Buat elemen spinner jika belum ada
            this.element = document.createElement('div');
            this.element.id = 'global-loading-spinner';
            this.element.innerHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
                        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                        <p class="text-gray-700 font-medium">Memuat data...</p>
                    </div>
                </div>
            `;
            this.element.style.display = 'none';
            document.body.appendChild(this.element);
        }
    },
    
    show() {
        this.init();
        this.element.style.display = 'block';
    },
    
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }
};

// Fungsi untuk mendapatkan token dari localStorage
function getAuthToken() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.token;
    }
    return null;
}

export const apiClient = {
    async post(endpoint, data) {
        LoadingSpinner.show();
        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            // Tambahkan Authorization header jika token ada
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                // Jika unauthorized, redirect ke login
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('userData');
                    window.location.href = '/';
                }
                throw new Error(resData.message || 'Terjadi kesalahan server');
            }
            
            return resData;
        } catch (error) {
            console.error(`API Post Error:`, error);
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },

    async get(endpoint) {
        LoadingSpinner.show();
        try {
            const token = getAuthToken();
            const headers = {
                'Accept': 'application/json'
            };
            
            // Tambahkan Authorization header jika token ada
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                // Jika unauthorized, redirect ke login
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('userData');
                    window.location.href = '/';
                }
                throw new Error('Gagal mengambil data');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Get Error:`, error);
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },

    async put(endpoint, data) {
        LoadingSpinner.show();
        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('userData');
                    window.location.href = '/';
                }
                throw new Error(resData.message || 'Terjadi kesalahan server');
            }
            
            return resData;
        } catch (error) {
            console.error(`API Put Error:`, error);
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },

    async delete(endpoint) {
        LoadingSpinner.show();
        try {
            const token = getAuthToken();
            const headers = {
                'Accept': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('userData');
                    window.location.href = '/';
                }
                throw new Error('Gagal menghapus data');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Delete Error:`, error);
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    }
};

window.ApiService = apiClient;

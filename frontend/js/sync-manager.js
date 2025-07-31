/**
 * SyncManager - Handles synchronization with the backend server
 */
export class SyncManager {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.token = localStorage.getItem('authToken');
        this.isEnabled = this.checkIfSyncEnabled();
    }

    /**
     * Get API base URL from configuration or environment
     * @returns {string} API base URL
     */
    getApiBaseUrl() {
        // Check for environment variable or use default
        const apiUrl = window.WORKOUT_API_URL || 'http://localhost:5000/api';
        return apiUrl;
    }

    /**
     * Check if sync is enabled (backend is available)
     * @returns {boolean} Whether sync is enabled
     */
    checkIfSyncEnabled() {
        // For now, disable sync by default to maintain offline-first functionality
        // This can be enabled in settings or automatically detected
        return localStorage.getItem('syncEnabled') === 'true';
    }

    /**
     * Enable or disable sync
     * @param {boolean} enabled - Whether to enable sync
     */
    setSyncEnabled(enabled) {
        localStorage.setItem('syncEnabled', enabled.toString());
        this.isEnabled = enabled;
    }

    /**
     * Set authentication token
     * @param {string} token - JWT token
     */
    setAuthToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    /**
     * Get authorization headers
     * @returns {Object} Headers object
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Make authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.isEnabled) {
            throw new Error('Sync is disabled');
        }

        const url = `${this.apiBaseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token expired, clear auth
                this.setAuthToken(null);
                throw new Error('Authentication required');
            }
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Sync request failed:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        return await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} Login response
     */
    async login(credentials) {
        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setAuthToken(response.token);
        }
        
        return response;
    }

    /**
     * Sync workouts with server
     * @param {Array} localWorkouts - Local workout data
     * @returns {Promise<Array>} Synced workouts
     */
    async syncWorkouts(localWorkouts) {
        if (!this.isEnabled || !this.token) {
            return localWorkouts; // Return local data if sync disabled or no auth
        }

        try {
            const response = await this.makeRequest('/workouts/sync', {
                method: 'POST',
                body: JSON.stringify({ workouts: localWorkouts })
            });
            
            return response.workouts || localWorkouts;
        } catch (error) {
            console.warn('Workout sync failed, using local data:', error);
            return localWorkouts;
        }
    }

    /**
     * Sync statistics with server
     * @param {Object} localStats - Local statistics data
     * @returns {Promise<Object>} Synced statistics
     */
    async syncStatistics(localStats) {
        if (!this.isEnabled || !this.token) {
            return localStats; // Return local data if sync disabled or no auth
        }

        try {
            const response = await this.makeRequest('/statistics', {
                method: 'PUT',
                body: JSON.stringify(localStats)
            });
            
            return response || localStats;
        } catch (error) {
            console.warn('Statistics sync failed, using local data:', error);
            return localStats;
        }
    }

    /**
     * Get server statistics
     * @returns {Promise<Object>} Server statistics
     */
    async getStatistics() {
        if (!this.isEnabled || !this.token) {
            return null;
        }

        try {
            return await this.makeRequest('/statistics');
        } catch (error) {
            console.warn('Failed to get server statistics:', error);
            return null;
        }
    }

    /**
     * Test connection to backend
     * @returns {Promise<boolean>} Whether backend is available
     */
    async testConnection() {
        try {
            // Try to reach the API without authentication
            const url = `${this.apiBaseUrl}/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: 'test', password: 'test' })
            });
            
            // We expect this to fail with 401 or 400, but not network error
            return response.status === 401 || response.status === 400;
        } catch (error) {
            console.warn('Backend connection test failed:', error);
            return false;
        }
    }

    /**
     * Get current authentication status
     * @returns {boolean} Whether user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Logout user
     */
    logout() {
        this.setAuthToken(null);
    }
}
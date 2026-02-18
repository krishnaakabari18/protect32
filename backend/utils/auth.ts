const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        const authToken = localStorage.getItem('auth_token');

        if (refreshToken && authToken) {
            // Call logout API
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        }
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        // Clear local storage and cookies regardless of API call result
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        document.cookie = 'auth_token=; path=/; max-age=0';
        
        // Redirect to login
        window.location.href = '/auth/boxed-signin';
    }
};

export const getUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    const user = getUser();
    return !!(token && user && user.user_type === 'admin');
};

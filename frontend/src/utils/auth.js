export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const clearToken = () => localStorage.removeItem('token');

export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
};
export const clearUser = () => localStorage.removeItem('user');
export const getRole = () => getUser()?.role || null;

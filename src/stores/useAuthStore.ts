import { create } from 'zustand';
import { api } from '../lib/api';
import type { AuthState, LoginResponse, Usuario } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('premier_token'),
  usuario: localStorage.getItem('premier_user')
    ? (JSON.parse(localStorage.getItem('premier_user')!) as Usuario)
    : null,
  isLoading: false,

  login: async (username: string, password: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
      const token = data.accessToken;
      localStorage.setItem('premier_token', token);

      const { data: userData } = await api.get<Usuario>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem('premier_user', JSON.stringify(userData));
      set({ token, usuario: userData, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('premier_token');
    localStorage.removeItem('premier_user');
    set({ token: null, usuario: null });
  },

  cargarSesion: (): void => {
    const token = localStorage.getItem('premier_token');
    const userStr = localStorage.getItem('premier_user');
    if (token && userStr) {
      set({ token, usuario: JSON.parse(userStr) as Usuario });
    }
  },
}));
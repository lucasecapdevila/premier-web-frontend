import { create } from 'zustand';
import { api } from '../lib/api';

interface Usuario {
  id: number;
  operador: string;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  cargarSesion: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('premier_token'),
  usuario: localStorage.getItem('premier_user')
    ? JSON.parse(localStorage.getItem('premier_user')!)
    : null,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      const token = data.accessToken;
      localStorage.setItem('premier_token', token);

      // Traer perfil del operador autenticado
      const { data: userData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem('premier_user', JSON.stringify(userData));
      set({ token, usuario: userData, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('premier_token');
    localStorage.removeItem('premier_user');
    set({ token: null, usuario: null });
  },

  cargarSesion: () => {
    const token = localStorage.getItem('premier_token');
    const userStr = localStorage.getItem('premier_user');
    if (token && userStr) {
      set({ token, usuario: JSON.parse(userStr) });
    }
  },
}));
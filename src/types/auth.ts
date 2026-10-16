export interface Usuario {
  id: number;
  operador: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  cargarSesion: () => void;
}
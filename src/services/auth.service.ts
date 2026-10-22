import { api } from '../lib/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UsuarioMeResponse {
  id: number;
  operador: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function getUsuarioActual(): Promise<UsuarioMeResponse> {
  const { data } = await api.get<UsuarioMeResponse>('/auth/me');
  return data;
}
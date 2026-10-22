import { api } from '../lib/api';

export interface ArticuloItem {
  jlv_codart: number;
  jlv_desc: string;
  jlv_rubro: number;
  jlv_prpu?: number;
}

export async function getArticulos(limit = 50): Promise<ArticuloItem[]> {
  const { data } = await api.get<ArticuloItem[]>('/articulos', {
    params: { limit },
  });
  return data;
}

export async function buscarArticulos(query: string): Promise<ArticuloItem[]> {
  const { data } = await api.get<ArticuloItem[]>('/articulos', {
    params: { q: query },
  });
  return data;
}

export async function getArticuloByCodigo(codigo: string | number): Promise<ArticuloItem> {
  const { data } = await api.get<ArticuloItem>(`/articulos/${codigo}`);
  return data;
}
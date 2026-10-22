import { api } from '../lib/api';
import type { TrazabilidadUnidadResponse } from '../types/trazabilidad';

export interface UnidadItem {
  id?: number;
  jlv_unicode: number;
  jlv_motor: string;
  jlv_chasis: string;
  jlv_color: string;
  jlv_sucursal: number;
  jlv_remito: number;
  jlv_codigomoto: string | number;
}

export interface UpdateUnidadPayload {
  remito: number;
  motivo: string;
  motor?: string;
  chasis?: string;
  color?: string;
}

export async function getUnidades(limit = 20): Promise<UnidadItem[]> {
  const { data } = await api.get<UnidadItem[]>('/unidades', {
    params: { limit },
  });
  return data;
}

export async function getUnidadByUnicode(unicode: number): Promise<UnidadItem> {
  const { data } = await api.get<UnidadItem>(`/unidades/${unicode}`);
  return data;
}

export async function getTrazabilidadUnidad(unicode: number): Promise<TrazabilidadUnidadResponse> {
  const { data } = await api.get<TrazabilidadUnidadResponse>(`/unidades/${unicode}/trazabilidad`);
  return data;
}

export async function updateUnidad(unicode: number, payload: UpdateUnidadPayload) {
  const { data } = await api.patch(`/unidades/${unicode}`, payload);
  return data;
}
import { api } from '../lib/api';

export interface RemitoListParams {
  limit?: number;
  page?: number;
}

export interface UnidadRemitoPayload {
  id?: number;
  motor?: string;
  chasis?: string;
  color: string;
}

export interface ArticuloRemitoPayload {
  codart: number;
  observa?: string;
  unidades: UnidadRemitoPayload[];
}

export interface CreateRemitoPayload {
  origen: number;
  destino: number;
  items: ArticuloRemitoPayload[];
}

export interface ReemplazarUnidadPayload {
  codart: number;
  unicode_saliente: number;
  unicode_entrante: number;
  motivo: string;
}

export async function getRemitos(params?: RemitoListParams) {
  const { data } = await api.get('/remitos', { params });
  return data;
}

export async function getRemitoDetalle(numero: number) {
  const { data } = await api.get(`/remitos/${numero}`);
  return data;
}

export async function crearRemito(payload: CreateRemitoPayload) {
  const { data } = await api.post('/remitos', payload);
  return data;
}

export async function anularRemito(numero: number, motivo: string) {
  const { data } = await api.post(`/remitos/${numero}/anular`, { motivo });
  return data;
}

export async function getUnidadesDisponiblesReemplazo(numero: number, codart: number) {
  const { data } = await api.get(`/remitos/${numero}/unidades-disponibles`, {
    params: { codart },
  });
  return data;
}

export async function reemplazarUnidadRemito(numero: number, payload: ReemplazarUnidadPayload) {
  const { data } = await api.patch(`/remitos/${numero}/reemplazar-unidad`, payload);
  return data;
}
import { api } from '../lib/api';
import type {
  PayloadAnularRemito,
  PayloadReemplazarUnidad,
  PayloadRemito,
  RemitoConsolidado,
  RemitoDetalleResponse,
  RemitoListParams,
  RespuestaCrearRemito,
  RespuestaReemplazoUnidad,
  UnidadDisponibleReemplazo,
} from '../types/remitos';

/**
 * Consulta el listado consolidado de remitos paginados con nombres de sucursales
 * y cálculo de la ventana operativa de 24 horas.
 */
export async function getRemitos(params?: RemitoListParams): Promise<RemitoConsolidado[]> {
  const { data } = await api.get<RemitoConsolidado[]>('/remitos', { params });
  return data;
}

/**
 * Obtiene la cabecera del remito, artículos y unidades físicas reconstruidas desde jlv_motomov.
 */
export async function getRemitoDetalle(numero: number): Promise<RemitoDetalleResponse> {
  const { data } = await api.get<RemitoDetalleResponse>(`/remitos/${numero}`);
  return data;
}

/**
 * Da de alta un remito atómico (compra 90 -> 1 o traslado entre sucursales)
 * con bloqueo pesimista de secuencias e inserción en la cola jlv_netmysql.
 */
export async function crearRemito(payload: PayloadRemito): Promise<RespuestaCrearRemito> {
  const { data } = await api.post<RespuestaCrearRemito>('/remitos', payload);
  return data;
}

/**
 * Anula transaccionalmente un remito dentro de la ventana de 24 horas,
 * validando que sea el último movimiento de cada unidad física.
 */
export async function anularRemito(
  numero: number,
  motivo: string,
): Promise<{ success: boolean; remito: number; tipo: string; motivo: string }> {
  const payload: PayloadAnularRemito = { motivo };
  const { data } = await api.post(`/remitos/${numero}/anular`, payload);
  return data;
}

/**
 * Lista las unidades activas disponibles en la sucursal de origen para reemplazar
 * una unidad asignada erróneamente en un remito de traslado.
 */
export async function getUnidadesDisponiblesReemplazo(
  numero: number,
  codart: number,
): Promise<UnidadDisponibleReemplazo[]> {
  const { data } = await api.get<UnidadDisponibleReemplazo[]>(
    `/remitos/${numero}/unidades-disponibles`,
    { params: { codart } },
  );
  return data;
}

/**
 * Ejecuta el reemplazo atómico de una unidad en un remito de traslado:
 * la unidad saliente se neutraliza con estado 9 y retorna a origen; la entrante viaja a destino.
 */
export async function reemplazarUnidadRemito(
  numero: number,
  payload: PayloadReemplazarUnidad,
): Promise<RespuestaReemplazoUnidad> {
  const { data } = await api.patch<RespuestaReemplazoUnidad>(
    `/remitos/${numero}/reemplazar-unidad`,
    payload,
  );
  return data;
}
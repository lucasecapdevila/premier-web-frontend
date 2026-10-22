export type TipoEventoTrazabilidad = 'ALTA' | 'TRASLADO' | 'RECTIFICACION';

export interface CambioRectificacion {
  campo: string;
  anterior: string | null;
  nuevo: string | null;
}

export interface EventoTrazabilidad {
  id: number;
  tipo: TipoEventoTrazabilidad;
  fecha: string;
  hora: string;
  operador: string;
  remito?: number | null;
  origen_id?: number | null;
  origen_nombre?: string | null;
  destino_id?: number | null;
  destino_nombre?: string | null;
  detalles: {
    motor?: string;
    chasis?: string;
    color_codigo?: string;
    color_nombre?: string;
    motivo?: string;
    cambios?: CambioRectificacion[];
  };
}

export interface TrazabilidadUnidadResponse {
  unicode: number;
  unidad_actual: {
    codart: number;
    descripcion: string;
    motor: string;
    chasis: string;
    color_codigo: string;
    color_nombre: string;
    sucursal_id: number;
    sucursal_nombre: string;
    remito_actual: number;
  };
  eventos: EventoTrazabilidad[];
}
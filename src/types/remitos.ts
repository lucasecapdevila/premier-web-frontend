import type { PayloadUnidad, UnidadDetalle } from './unidades';

export interface RemitoConsolidado {
  nro: number;
  de: number;
  de_nombre: string;
  a: number;
  a_nombre: string;
  fecha: string;
  fecha_dt: string;
  operador: string;
  estado: number;
  id_borrado: string;
  motivo_anula: string;
  motivo_edic: string;
  total_articulos: number;
  total_unidades: number;
  en_ventana_24h: boolean;
  es_anulado: boolean;
}

export interface ArticuloDetalle {
  codart: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  observa: string;
}

export interface RemitoDetalleResponse {
  remito: {
    nro: number;
    de: number;
    de_nombre: string;
    a: number;
    a_nombre: string;
    operador: string;
    fecha: string;
    fecha_dt: string;
    es_anulado: boolean;
    en_ventana_24h: boolean;
    motivo_anula: string;
    motivo_edic: string;
  };
  articulos: ArticuloDetalle[];
  unidades: UnidadDetalle[];
  total_unidades: number;
}

export interface PayloadArticulo {
  codart: number;
  observa: string;
  unidades: PayloadUnidad[];
}

export interface PayloadRemito {
  origen: number;
  destino: number;
  items: PayloadArticulo[];
}

export interface RespuestaCrearRemito {
  success: boolean;
  remito: number;
  origen: number;
  destino: number;
  tipo: 'COMPRA' | 'TRASLADO';
}

export interface PayloadAnularRemito {
  motivo: string;
}

export interface PayloadReemplazarUnidad {
  codart: number;
  unicode_saliente: number;
  unicode_entrante: number;
  motivo: string;
}
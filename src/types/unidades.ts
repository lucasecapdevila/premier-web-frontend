export interface UnidadStock {
  id: number;
  jlv_unicode: number;
  jlv_motor: string;
  jlv_chasis: string;
  jlv_color: string;
  jlv_sucursal: number;
  jlv_remito: number;
  jlv_codigomoto: string;
}

export interface UnidadDetalle {
  id: number;
  unicode: number;
  motor: string;
  chasis: string;
  color_codigo: string;
  color_nombre: string;
  codart: number;
  descripcion: string;
  fecha_mov: string;
  estado: number;
}

export interface UnidadFormulario {
  motor: string;
  chasis: string;
  color: string;
}

export interface PayloadUnidad {
  id?: number;
  motor?: string;
  chasis?: string;
  color: string;
}
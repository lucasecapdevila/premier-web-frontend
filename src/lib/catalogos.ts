import type { SucursalCatalogo, ColorCatalogo } from '../types';

export const MAPA_SUCURSALES: Record<number, string> = {
  1: 'Casa Central',
  2: 'Sucursal Alberdi',
  3: 'Sucursal Concepción',
  4: 'Sucursal Tafi',
  5: 'Sucursal La Cocha',
  6: 'Sucursal Monteros',
  7: 'Sucursal Logar',
  8: 'SUCURSAL SCRIPCASE',
  9: 'SUCURSAL S.M.TUCUMAN',
  90: 'Compras',
  91: 'Inventario',
  92: 'Dev.cliente',
  100: 'Depósito Central',
};

export const SUCURSALES_OPCIONES: readonly SucursalCatalogo[] = [
  { id: 90, nombre: 'Compras (Proveedor)' },
  { id: 1, nombre: 'Casa Central' },
  { id: 2, nombre: 'Sucursal Alberdi' },
  { id: 3, nombre: 'Sucursal Concepción' },
  { id: 4, nombre: 'Sucursal Tafi' },
  { id: 5, nombre: 'Sucursal La Cocha' },
  { id: 6, nombre: 'Sucursal Monteros' },
  { id: 7, nombre: 'Sucursal Logar' },
];

export const MAPA_COLORES: Record<string, string> = {
  '': 'Sin Color',
  AMAR: 'Amarillo',
  AZUL: 'Azul',
  'AZ-N': 'Azul y Negro',
  'AZ-G': 'Azul y Gris',
  BEIG: 'Beige',
  'BL-N': 'Blanco y Negro',
  BLCO: 'Blanco',
  CELE: 'Celeste',
  GRIS: 'Gris',
  MARR: 'Marrón',
  NRJA: 'Naranja',
  NGRO: 'Negro',
  'NR-G': 'Negro y Gris',
  PLTA: 'Plateado',
  ROJO: 'Rojo',
  'RO-G': 'Rojo y Gris',
  'RO-N': 'Rojo y Negro',
  VERD: 'Verde',
  'VR-B': 'Verde y Blanco',
  'VR-N': 'Verde y Negro',
  VIOL: 'Violeta',
};

export const COLORES_OPCIONES: readonly ColorCatalogo[] = [
  { codigo: 'NGRO', nombre: 'Negro' },
  { codigo: 'BLCO', nombre: 'Blanco' },
  { codigo: 'ROJO', nombre: 'Rojo' },
  { codigo: 'AZUL', nombre: 'Azul' },
  { codigo: 'GRIS', nombre: 'Gris' },
  { codigo: 'PLTA', nombre: 'Plateado' },
  { codigo: 'AMAR', nombre: 'Amarillo' },
  { codigo: 'VERD', nombre: 'Verde' },
  { codigo: 'NRJA', nombre: 'Naranja' },
  { codigo: 'AZ-N', nombre: 'Azul y Negro' },
  { codigo: 'RO-N', nombre: 'Rojo y Negro' },
  { codigo: 'BL-N', nombre: 'Blanco y Negro' },
];

export function obtenerNombreSucursal(id: number | null | undefined): string {
  if (id == null) return 'Sin sucursal';
  return MAPA_SUCURSALES[id] ?? `Sucursal ${id}`;
}

export function obtenerNombreColor(codigo: string | null | undefined): string {
  if (!codigo || codigo.trim() === '') return 'Sin Color';
  const codTrim = codigo.trim().toUpperCase();
  return MAPA_COLORES[codTrim] ?? codigo;
}
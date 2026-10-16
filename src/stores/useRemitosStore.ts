import { create } from 'zustand';
import { api } from '../lib/api';

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

interface RemitosState {
  remitos: RemitoConsolidado[];
  totalRemitos: number;
  loading: boolean;
  pagina: number;
  limite: number;
  filtroTexto: string;
  cargarRemitos: (page?: number, limit?: number) => Promise<void>;
  setFiltroTexto: (texto: string) => void;
}

export const useRemitosStore = create<RemitosState>((set) => ({
  remitos: [],
  totalRemitos: 0,
  loading: false,
  pagina: 1,
  limite: 25,
  filtroTexto: '',

  cargarRemitos: async (page = 1, limit = 25) => {
    set({ loading: true, pagina: page, limite: limit });
    try {
      const { data } = await api.get<RemitoConsolidado[]>('/remitos', {
        params: { page, limit },
      });
      set({ remitos: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setFiltroTexto: (texto: string) => set({ filtroTexto: texto }),
}));
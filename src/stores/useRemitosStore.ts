import { create } from 'zustand';
import { api } from '../lib/api';
import type { RemitoConsolidado } from '../types';

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

  cargarRemitos: async (page = 1, limit = 25): Promise<void> => {
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

  setFiltroTexto: (texto: string): void => set({ filtroTexto: texto }),
}));
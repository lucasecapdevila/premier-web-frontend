import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../lib/api';
import type { UnidadDisponibleStock } from '../types';

interface ModalSeleccionarUnidadesStockProps {
  sucursalId: number;
  sucursalNombre: string;
  codart: number;
  seleccionadasPreviamente: number[]; // IDs de unidades ya agregadas
  onClose: () => void;
  onConfirmar: (unidades: UnidadDisponibleStock[]) => void;
}

export const ModalSeleccionarUnidadesStock: React.FC<ModalSeleccionarUnidadesStockProps> = ({
  sucursalId,
  sucursalNombre,
  codart,
  seleccionadasPreviamente,
  onClose,
  onConfirmar,
}) => {
  const [unidades, setUnidades] = useState<UnidadDisponibleStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    let activo = true;

    const fetchStock = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await api.get<UnidadDisponibleStock[]>('/unidades/stock/disponibles', {
          params: { sucursal: sucursalId, codart },
        });
        if (activo) {
          // Filtrar las que ya estén añadidas en la grilla previa
          const disponibles = res.data.filter(
            (u) => !seleccionadasPreviamente.includes(u.id)
          );
          setUnidades(disponibles);
          setLoading(false);
        }
      } catch (error: unknown) {
        if (activo) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message ?? 'Error al consultar stock de la sucursal');
          setLoading(false);
        }
      }
    };

    void fetchStock();

    return () => {
      activo = false;
    };
  }, [sucursalId, codart, seleccionadasPreviamente]);

  const toggleSeleccion = (id: number): void => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAceptar = (): void => {
    const elegidas = unidades.filter((u) => seleccionados.includes(u.id));
    onConfirmar(elegidas);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="text-blue-500" size={20} />
            <div>
              <h3 className="text-lg font-bold text-white">
                Seleccionar Unidades en {sucursalNombre}
              </h3>
              <p className="text-xs text-slate-400">
                Artículo #{codart} disponible para traslado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RotateCcw size={24} className="animate-spin text-blue-500 mb-2" />
              <p className="text-xs">Consultando inventario en la sucursal...</p>
            </div>
          ) : unidades.length === 0 ? (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              <span>No se encontraron unidades activas disponibles de este artículo en {sucursalNombre}.</span>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/50 uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">Sel.</th>
                    <th className="py-2.5 px-3">Unicode</th>
                    <th className="py-2.5 px-3">Motor</th>
                    <th className="py-2.5 px-3">Chasis</th>
                    <th className="py-2.5 px-3">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {unidades.map((u) => {
                    const checked = seleccionados.includes(u.id);
                    return (
                      <tr
                        key={u.id}
                        onClick={() => toggleSeleccion(u.id)}
                        className={`cursor-pointer transition-colors ${
                          checked ? 'bg-blue-950/30 text-white' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}} // Manejado por onClick de fila
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">#{u.unicode}</td>
                        <td className="py-2.5 px-3 font-mono">{u.motor}</td>
                        <td className="py-2.5 px-3 font-mono">{u.chasis}</td>
                        <td className="py-2.5 px-3">{u.color_nombre}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Seleccionadas: <strong className="text-white">{seleccionados.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={seleccionados.length === 0}
              onClick={handleAceptar}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              <Check size={14} />
              <span>Agregar al Remito</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
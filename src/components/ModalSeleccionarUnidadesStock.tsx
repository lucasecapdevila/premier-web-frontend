import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../lib/api';
import type { UnidadDisponibleStock } from '../types';

interface ModalSeleccionarUnidadesStockProps {
  sucursalId: number;
  sucursalNombre: string;
  codart: number;
  seleccionadasPreviamente: number[];
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-stroke rounded-xl max-w-2xl w-full p-6 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-stroke shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="text-brand-hover" size={18} />
            <div>
              <h3 className="text-base font-bold text-content-primary">
                Seleccionar Unidades en {sucursalNombre}
              </h3>
              <p className="text-[11px] text-content-secondary">
                Artículo #{codart} disponible para traslado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-content-secondary hover:text-content-primary rounded hover:bg-surface-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="py-3 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-content-secondary">
              <RotateCcw size={20} className="animate-spin text-brand-hover mb-2" />
              <p className="text-xs">Consultando inventario en sucursal...</p>
            </div>
          ) : unidades.length === 0 ? (
            <div className="p-3 bg-warning-soft border border-warning/30 rounded-md text-xs text-warning-dark flex items-center gap-2">
              <AlertTriangle size={15} className="text-warning shrink-0" />
              <span>No se encontraron unidades activas disponibles de este artículo en {sucursalNombre}.</span>
            </div>
          ) : (
            <div className="border border-stroke rounded-md overflow-hidden">
              <table className="w-full text-left text-xs text-content-primary">
                <thead className="bg-surface-secondary uppercase text-content-secondary border-b border-stroke text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-center w-10">Sel.</th>
                    <th className="py-2 px-3">Unicode</th>
                    <th className="py-2 px-3">Motor</th>
                    <th className="py-2 px-3">Chasis</th>
                    <th className="py-2 px-3">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke">
                  {unidades.map((u) => {
                    const checked = seleccionados.includes(u.id);
                    return (
                      <tr
                        key={u.id}
                        onClick={() => toggleSeleccion(u.id)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          checked ? 'bg-[#FEE2E2]/40 text-content-primary' : 'hover:bg-surface-hover'
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}}
                            className="rounded border-stroke text-brand-hover focus:ring-brand-light"
                          />
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-content-primary">#{u.unicode}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{u.motor}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{u.chasis}</td>
                        <td className="py-2 px-3 text-content-secondary">{u.color_nombre}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-stroke flex items-center justify-between shrink-0">
          <span className="text-xs text-content-secondary">
            Seleccionadas: <strong className="text-content-primary font-mono">{seleccionados.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-surface-secondary hover:bg-stroke text-content-primary rounded-md text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={seleccionados.length === 0}
              onClick={handleAceptar}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-hover hover:bg-brand-pressed text-white rounded-md text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Check size={13} />
              <span>Agregar al Remito</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
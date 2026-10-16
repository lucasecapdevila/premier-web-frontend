import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import type { 
  UnidadDetalle, 
  UnidadDisponibleReemplazo, 
  PayloadReemplazarUnidad,
  RespuestaReemplazoUnidad 
} from '../types';

interface ModalReemplazarUnidadProps {
  nroRemito: number;
  origenNombre: string;
  destinoNombre: string;
  unidadSaliente: UnidadDetalle;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const ModalReemplazarUnidad: React.FC<ModalReemplazarUnidadProps> = ({
  nroRemito,
  origenNombre,
  destinoNombre,
  unidadSaliente,
  onClose,
  onSuccess,
}) => {
  const [disponibles, setDisponibles] = useState<UnidadDisponibleReemplazo[]>([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState<boolean>(true);
  const [unicodeEntrante, setUnicodeEntrante] = useState<number | ''>('');
  const [motivo, setMotivo] = useState<string>('');
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    let activo = true;

    const cargarDisponibles = async (): Promise<void> => {
      setLoadingDisponibles(true);
      try {
        const res = await api.get<UnidadDisponibleReemplazo[]>(
          `/remitos/${nroRemito}/unidades-disponibles`,
          { params: { codart: unidadSaliente.codart } }
        );
        if (activo) {
          setDisponibles(res.data);
          if (res.data.length > 0) {
            setUnicodeEntrante(res.data[0].unicode);
          }
          setLoadingDisponibles(false);
        }
      } catch (error: unknown) {
        if (activo) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message ?? 'Error al buscar unidades disponibles');
          setLoadingDisponibles(false);
        }
      }
    };

    void cargarDisponibles();

    return () => {
      activo = false;
    };
  }, [nroRemito, unidadSaliente.codart]);

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    if (!unicodeEntrante) {
      toast.error('Debe seleccionar la unidad entrante');
      return;
    }

    if (!motivo.trim()) {
      toast.error('El motivo de modificación es obligatorio');
      return;
    }

    setProcesando(true);
    try {
      const payload: PayloadReemplazarUnidad = {
        codart: unidadSaliente.codart,
        unicode_saliente: unidadSaliente.unicode,
        unicode_entrante: Number(unicodeEntrante),
        motivo: motivo.trim(),
      };

      await api.patch<RespuestaReemplazoUnidad>(
        `/remitos/${nroRemito}/reemplazar-unidad`,
        payload
      );

      toast.success('Unidad reemplazada correctamente en el remito');
      await onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Error al reemplazar la unidad');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-blue-500" size={20} />
            <h3 className="text-lg font-bold text-white">
              Reemplazar Unidad en Remito #{nroRemito}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e.nativeEvent)} className="space-y-4 pt-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
            <div className="text-slate-400">
              Artículo: <span className="text-slate-200 font-medium">{unidadSaliente.descripcion}</span> ({unidadSaliente.codart})
            </div>
            <div className="text-slate-400">
              Circuito: <span className="text-slate-200 font-medium">{origenNombre}</span> → <span className="text-slate-200 font-medium">{destinoNombre}</span>
            </div>
          </div>

          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
            <span className="block text-xs font-semibold uppercase text-red-400 mb-1">
              Unidad Saliente (Vuelve a {origenNombre})
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
              <div>Unicode: <strong className="text-white">#{unidadSaliente.unicode}</strong></div>
              <div>Color: {unidadSaliente.color_nombre}</div>
              <div>Motor: {unidadSaliente.motor}</div>
              <div>Chasis: {unidadSaliente.chasis}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Unidad Entrante Disponible en {origenNombre} (* Obligatorio)
            </label>

            {loadingDisponibles ? (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-blue-500" />
                <span>Buscando unidades activas en stock de origen...</span>
              </div>
            ) : disponibles.length === 0 ? (
              <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                <span>No hay otras unidades activas de este artículo en {origenNombre}.</span>
              </div>
            ) : (
              <select
                value={unicodeEntrante}
                onChange={(e) => setUnicodeEntrante(Number(e.target.value))}
                disabled={procesando}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {disponibles.map((disp) => (
                  <option key={disp.unicode} value={disp.unicode}>
                    #{disp.unicode} — Motor: {disp.motor} | Chasis: {disp.chasis} | {disp.color_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Motivo del Reemplazo (* Obligatorio)
            </label>
            <textarea
              required
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Cambio de unidad por error en carga de número de chasis..."
              disabled={procesando}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={procesando}
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando || loadingDisponibles || disponibles.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {procesando ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>Confirmar Reemplazo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
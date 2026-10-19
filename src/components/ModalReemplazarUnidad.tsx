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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-stroke rounded-xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stroke">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-brand-hover" size={18} />
            <h3 className="text-base font-bold text-content-primary">
              Reemplazar Unidad en Remito #{nroRemito}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="p-1 text-content-secondary hover:text-content-primary rounded hover:bg-surface-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e.nativeEvent)} className="space-y-4 pt-3">
          <div className="p-3 bg-surface-hover border border-stroke rounded-md text-xs space-y-0.5">
            <div>
              <span className="text-content-secondary">Artículo:</span>{' '}
              <span className="font-semibold text-content-primary">{unidadSaliente.descripcion}</span>{' '}
              <span className="font-mono text-content-secondary">({unidadSaliente.codart})</span>
            </div>
            <div>
              <span className="text-content-secondary">Circuito:</span>{' '}
              <span className="font-semibold text-content-primary">{origenNombre}</span> &rarr;{' '}
              <span className="font-semibold text-content-primary">{destinoNombre}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FEE2E2]/50 border border-error/20 rounded-md">
            <span className="block text-[11px] font-semibold uppercase text-[#991B1B] mb-1">
              Unidad Saliente (Regresa a {origenNombre})
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-content-primary">
              <div>Unicode: <strong>#{unidadSaliente.unicode}</strong></div>
              <div>Color: {unidadSaliente.color_nombre}</div>
              <div>Motor: {unidadSaliente.motor}</div>
              <div>Chasis: {unidadSaliente.chasis}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase mb-1">
              Unidad Entrante Disponible en {origenNombre} (* Obligatorio)
            </label>

            {loadingDisponibles ? (
              <div className="p-2.5 bg-surface-hover border border-stroke rounded-md text-xs text-content-secondary flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-brand-hover" />
                <span>Buscando inventario en origen...</span>
              </div>
            ) : disponibles.length === 0 ? (
              <div className="p-3 bg-warning-soft border border-warning/30 rounded-md text-xs text-warning-dark flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-warning" />
                <span>No hay otras unidades activas de este artículo en {origenNombre}.</span>
              </div>
            ) : (
              <select
                value={unicodeEntrante}
                onChange={(e) => setUnicodeEntrante(Number(e.target.value))}
                disabled={procesando}
                className="w-full bg-white border border-stroke rounded-md p-2 text-xs font-mono text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
              >
                {disponibles.map((disp) => (
                  <option key={disp.unicode} value={disp.unicode}>
                    #{disp.unicode} &mdash; Motor: {disp.motor} | Chasis: {disp.chasis} | {disp.color_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase mb-1">
              Motivo del Reemplazo (* Obligatorio)
            </label>
            <textarea
              required
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalle el motivo técnico o administrativo del cambio..."
              disabled={procesando}
              className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={procesando}
              onClick={onClose}
              className="px-3.5 py-2 bg-surface-secondary hover:bg-surface-hover text-content-primary rounded-md text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando || loadingDisponibles || disponibles.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-error hover:bg-error-hover text-white rounded-md text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {procesando ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} />
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
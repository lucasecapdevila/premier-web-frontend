import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Ban, 
  Clock, 
  RotateCcw,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';
import { ModalReemplazarUnidad } from '../components/ModalReemplazarUnidad';
import type { RemitoDetalleResponse, UnidadDetalle } from '../types';

export const RemitoDetallePage: React.FC = () => {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RemitoDetalleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalAnulacion, setModalAnulacion] = useState<boolean>(false);
  const [motivoAnula, setMotivoAnula] = useState<string>('');
  const [procesandoAnula, setProcesandoAnula] = useState<boolean>(false);

  const [unidadParaReemplazo, setUnidadParaReemplazo] = useState<UnidadDetalle | null>(null);

  const refrescarDatos = async (): Promise<void> => {
    if (!numero) return;
    setLoading(true);
    try {
      const res = await api.get<RemitoDetalleResponse>(`/remitos/${numero}`);
      setData(res.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Error al obtener el remito');
      navigate('/remitos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const fetchDetalle = async (): Promise<void> => {
      if (!numero) return;
      try {
        const res = await api.get<RemitoDetalleResponse>(`/remitos/${numero}`);
        if (activo) {
          setData(res.data);
          setLoading(false);
        }
      } catch (error: unknown) {
        if (activo) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message ?? 'Error al obtener el remito');
          setLoading(false);
          navigate('/remitos');
        }
      }
    };

    void fetchDetalle();

    return () => {
      activo = false;
    };
  }, [numero, navigate]);

  const handleAnular = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    if (!motivoAnula.trim()) {
      toast.error('El motivo de anulación es obligatorio');
      return;
    }

    setProcesandoAnula(true);
    try {
      await api.post(`/remitos/${numero}/anular`, {
        motivo: motivoAnula.trim(),
      });
      toast.success(`Remito #${numero} anulado exitosamente`);
      setModalAnulacion(false);
      setMotivoAnula('');
      await refrescarDatos();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Error al anular el remito');
    } finally {
      setProcesandoAnula(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <RotateCcw className="animate-spin mb-3 text-blue-500" size={32} />
        <p className="text-sm font-medium">Cargando trazabilidad del remito...</p>
      </div>
    );
  }

  if (!data) return null;

  const { remito, articulos, unidades } = data;
  const esCompra = remito.de === 90;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/remitos')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
            title="Volver al listado"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
                Remito #{remito.nro}
              </h1>
              {remito.es_anulado ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900/40 text-red-400 border border-red-800/60">
                  <Ban size={12} />
                  Anulado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-800/60">
                  <CheckCircle2 size={12} />
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tipo de movimiento: <strong className="text-slate-200">{esCompra ? 'Compra (Alta)' : 'Traslado entre sucursales'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!remito.es_anulado && remito.en_ventana_24h && (
            <button
              type="button"
              onClick={() => setModalAnulacion(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-800/60 rounded-lg text-sm font-medium transition-colors"
            >
              <Ban size={16} />
              <span>Anular Remito</span>
            </button>
          )}
        </div>
      </div>

      {remito.es_anulado && (
        <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-300 text-sm">
          <AlertTriangle className="shrink-0 text-red-400 mt-0.5" size={18} />
          <div>
            <strong className="font-semibold block text-red-200">Remito Anulado:</strong>
            {remito.motivo_anula || 'Sin motivo especificado.'}
          </div>
        </div>
      )}

      {remito.motivo_edic && (
        <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3 text-amber-300 text-sm">
          <Clock className="shrink-0 text-amber-400 mt-0.5" size={18} />
          <div>
            <strong className="font-semibold block text-amber-200">Modificación Registrada:</strong>
            {remito.motivo_edic}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1.5 mb-2">
            <ArrowRight size={14} className="text-blue-500" />
            Recorrido Físico
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-slate-400">De:</span>{' '}
              <span className="font-semibold text-white">{remito.de_nombre}</span>{' '}
              <span className="text-xs text-slate-500 font-mono">({remito.de})</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-400">A:</span>{' '}
              <span className="font-semibold text-white">{remito.a_nombre}</span>{' '}
              <span className="text-xs text-slate-500 font-mono">({remito.a})</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1.5 mb-2">
            <Calendar size={14} className="text-blue-500" />
            Fecha y Plazo
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-white">
              {remito.fecha.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}
            </div>
            <div className="text-xs text-slate-400">
              {remito.en_ventana_24h ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock size={12} /> Dentro de la ventana de 24 horas
                </span>
              ) : (
                <span className="text-slate-500">Ventana de edición cerrada</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1.5 mb-2">
            <User size={14} className="text-blue-500" />
            Auditoría
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-slate-400">Operador:</span>{' '}
              <span className="font-mono font-medium text-white">{remito.operador}</span>
            </div>
            <div className="text-xs text-slate-400">
              Total Unidades: <span className="font-semibold text-white">{data.total_unidades}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            Artículos Declarados en Remito
          </h2>
        </div>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/30 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Cód. Artículo</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4 text-center">Cantidad</th>
              <th className="py-3 px-4">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {articulos.map((art) => (
              <tr key={art.codart}>
                <td className="py-3 px-4 font-mono font-bold text-white">{art.codart}</td>
                <td className="py-3 px-4 text-slate-200">{art.descripcion || 'Sin descripción'}</td>
                <td className="py-3 px-4 text-center font-semibold text-white">{art.cantidad}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{art.observa || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Trazabilidad de Unidades Físicas (Padrón)
          </h2>
          <span className="text-xs text-slate-400">
            Reconstruido desde <code className="text-blue-400">jlv_motomov</code>
          </span>
        </div>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/30 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Unicode</th>
              <th className="py-3 px-4">Motor</th>
              <th className="py-3 px-4">Chasis</th>
              <th className="py-3 px-4">Color</th>
              <th className="py-3 px-4">Artículo</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {unidades.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-400">#{u.unicode}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-200">{u.motor}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-200">{u.chasis}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 text-slate-200">
                    {u.color_nombre}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-400">
                  {u.descripcion} <span className="font-mono">({u.codart})</span>
                </td>
                <td className="py-3 px-4 text-right">
                  {!remito.es_anulado && !esCompra && remito.en_ventana_24h ? (
                    <button
                      type="button"
                      onClick={() => setUnidadParaReemplazo(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded text-xs font-medium border border-slate-700 transition-colors"
                      title="Reemplazar esta unidad en el traslado"
                    >
                      <RefreshCw size={12} />
                      <span>Reemplazar</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400">
                      Registrado
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAnulacion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={20} />
              Confirmar Anulación del Remito #{remito.nro}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Esta acción revertirá las ubicaciones de stock o dará la baja lógica correspondiente según el origen del movimiento.
            </p>

            <form onSubmit={(e) => void handleAnular(e.nativeEvent)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Motivo de Anulación (* Obligatorio)
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoAnula}
                  onChange={(e) => setMotivoAnula(e.target.value)}
                  placeholder="Ej: Error administrativo en número de unidades cargadas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={procesandoAnula}
                  onClick={() => setModalAnulacion(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAnula}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {procesandoAnula ? 'Anulando...' : 'Confirmar Anulación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {unidadParaReemplazo && (
        <ModalReemplazarUnidad
          nroRemito={remito.nro}
          origenNombre={remito.de_nombre}
          destinoNombre={remito.a_nombre}
          unidadSaliente={unidadParaReemplazo}
          onClose={() => setUnidadParaReemplazo(null)}
          onSuccess={refrescarDatos}
        />
      )}
    </div>
  );
};

export default RemitoDetallePage;
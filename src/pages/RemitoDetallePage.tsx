import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import { ModalReemplazarUnidad } from "../components/ModalReemplazarUnidad";
import type { RemitoDetalleResponse, UnidadDetalle } from "../types";
import { ModalTrazabilidadUnidad } from "../components/unidades/ModalTrazabilidadUnidad";

export const RemitoDetallePage: React.FC = () => {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RemitoDetalleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalAnulacion, setModalAnulacion] = useState<boolean>(false);
  const [motivoAnula, setMotivoAnula] = useState<string>("");
  const [procesandoAnula, setProcesandoAnula] = useState<boolean>(false);
  const [unidadParaReemplazo, setUnidadParaReemplazo] =
    useState<UnidadDetalle | null>(null);
  const [unicodeTrazabilidad, setUnicodeTrazabilidad] = useState<number | null>(
    null,
  );

  const refrescarDatos = async (): Promise<void> => {
    if (!numero) return;
    setLoading(true);
    try {
      const res = await api.get<RemitoDetalleResponse>(`/remitos/${numero}`);
      setData(res.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Error al obtener el remito");
      navigate("/remitos");
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
          toast.error(
            err.response?.data?.message ?? "Error al obtener el remito",
          );
          setLoading(false);
          navigate("/remitos");
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
      toast.error("El motivo de anulación es obligatorio");
      return;
    }

    setProcesandoAnula(true);
    try {
      await api.post(`/remitos/${numero}/anular`, {
        motivo: motivoAnula.trim(),
      });
      toast.success(`Remito #${numero} anulado exitosamente`);
      setModalAnulacion(false);
      setMotivoAnula("");
      await refrescarDatos();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Error al anular el remito");
    } finally {
      setProcesandoAnula(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-content-secondary">
        <RotateCcw className="animate-spin mb-2 text-brand-hover" size={26} />
        <p className="text-xs">Cargando trazabilidad del remito...</p>
      </div>
    );
  }

  if (!data) return null;

  const { remito, articulos, unidades } = data;
  const esCompra = remito.de === 90;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stroke pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/remitos")}
            className="p-1.5 bg-white hover:bg-surface-secondary text-content-secondary hover:text-content-primary rounded-md border border-stroke transition-colors duration-150"
            title="Volver"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-content-primary tracking-tight font-mono">
                Remito #{remito.nro}
              </h1>
              {remito.es_anulado ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-error/20">
                  <Ban size={11} />
                  Anulado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-success-soft text-success-dark border border-success/20">
                  <CheckCircle2 size={11} />
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              Tipo:{" "}
              <strong className="text-content-primary">
                {esCompra
                  ? "Compra (Alta Directa)"
                  : "Traslado entre Sucursales"}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!remito.es_anulado && remito.en_ventana_24h && (
            <button
              type="button"
              onClick={() => setModalAnulacion(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEE2E2] hover:bg-error text-[#991B1B] hover:text-white border border-error/30 rounded-md text-xs font-semibold transition-colors duration-150"
            >
              <Ban size={14} />
              <span>Anular Remito</span>
            </button>
          )}
        </div>
      </div>

      {remito.es_anulado && (
        <div className="p-3.5 bg-[#FEE2E2] border border-error/30 rounded-lg flex items-start gap-2.5 text-[#991B1B] text-xs">
          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
          <div>
            <strong className="font-semibold block">
              Motivo de Anulación:
            </strong>
            {remito.motivo_anula || "Sin motivo especificado."}
          </div>
        </div>
      )}

      {remito.motivo_edic && (
        <div className="p-3.5 bg-warning-soft border border-warning/30 rounded-lg flex items-start gap-2.5 text-warning-dark text-xs">
          <Clock className="shrink-0 mt-0.5" size={16} />
          <div>
            <strong className="font-semibold block">
              Modificación Registrada:
            </strong>
            {remito.motivo_edic}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-stroke rounded-lg p-3.5 shadow-sm">
          <div className="text-[11px] uppercase text-content-secondary font-semibold tracking-wider flex items-center gap-1.5 mb-1.5">
            <ArrowRight size={13} className="text-brand-hover" />
            Recorrido Físico
          </div>
          <div className="space-y-0.5 text-xs">
            <div>
              <span className="text-content-secondary">De:</span>{" "}
              <span className="font-semibold text-content-primary">
                {remito.de_nombre}
              </span>{" "}
              <span className="text-content-secondary font-mono text-[11px]">
                ({remito.de})
              </span>
            </div>
            <div>
              <span className="text-content-secondary">A:</span>{" "}
              <span className="font-semibold text-content-primary">
                {remito.a_nombre}
              </span>{" "}
              <span className="text-content-secondary font-mono text-[11px]">
                ({remito.a})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stroke rounded-lg p-3.5 shadow-sm">
          <div className="text-[11px] uppercase text-content-secondary font-semibold tracking-wider flex items-center gap-1.5 mb-1.5">
            <Calendar size={13} className="text-brand-hover" />
            Fecha y Plazo
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-content-primary">
              {remito.fecha.replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1")}
            </div>
            <div>
              {remito.en_ventana_24h ? (
                <span className="text-warning font-medium flex items-center gap-1 text-[11px]">
                  <Clock size={11} /> Dentro de la ventana de 24 horas
                </span>
              ) : (
                <span className="text-content-secondary text-[11px]">
                  Ventana de edición cerrada
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-stroke rounded-lg p-3.5 shadow-sm">
          <div className="text-[11px] uppercase text-content-secondary font-semibold tracking-wider flex items-center gap-1.5 mb-1.5">
            <User size={13} className="text-brand-hover" />
            Auditoría
          </div>
          <div className="space-y-0.5 text-xs">
            <div>
              <span className="text-content-secondary">Operador:</span>{" "}
              <span className="font-mono font-medium text-content-primary">
                {remito.operador}
              </span>
            </div>
            <div className="text-content-secondary">
              Total Unidades:{" "}
              <span className="font-semibold text-content-primary font-mono">
                {data.total_unidades}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stroke rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-surface-secondary border-b border-stroke">
          <h2 className="text-xs font-semibold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-brand-hover" />
            Artículos Declarados en Remito
          </h2>
        </div>
        <table className="w-full text-left text-xs text-content-primary">
          <thead className="bg-surface-hover border-b border-stroke text-[11px] uppercase text-content-secondary font-semibold">
            <tr>
              <th className="py-2.5 px-4">Cód. Artículo</th>
              <th className="py-2.5 px-4">Descripción</th>
              <th className="py-2.5 px-4 text-center">Cantidad</th>
              <th className="py-2.5 px-4">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke">
            {articulos.map((art) => (
              <tr key={art.codart}>
                <td className="py-2.5 px-4 font-mono font-bold text-content-primary">
                  {art.codart}
                </td>
                <td className="py-2.5 px-4">
                  {art.descripcion || "Sin descripción"}
                </td>
                <td className="py-2.5 px-4 text-center font-mono font-semibold">
                  {art.cantidad}
                </td>
                <td className="py-2.5 px-4 text-content-secondary text-[11px]">
                  {art.observa || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-stroke rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-surface-secondary border-b border-stroke flex items-center justify-between">
          <h2 className="text-xs font-semibold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-success" />
            Trazabilidad de Unidades Físicas (Padrón)
          </h2>
        </div>
        <table className="w-full text-left text-xs text-content-primary">
          <thead className="bg-surface-hover border-b border-stroke text-[11px] uppercase text-content-secondary font-semibold">
            <tr>
              <th className="py-2.5 px-4">Unicode</th>
              <th className="py-2.5 px-4">Motor</th>
              <th className="py-2.5 px-4">Chasis</th>
              <th className="py-2.5 px-4">Color</th>
              <th className="py-2.5 px-4">Artículo</th>
              <th className="py-2.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke">
            {unidades.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-surface-hover transition-colors duration-150"
              >
                <td className="py-2.5 px-4 font-mono font-bold text-content-primary">
                  #{u.unicode}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-content-primary">
                  {u.motor}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-content-primary">
                  {u.chasis}
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-surface-secondary border border-stroke text-content-primary">
                    {u.color_nombre}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-content-secondary">
                  {u.descripcion}{" "}
                  <span className="font-mono text-[11px]">({u.codart})</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  {!remito.es_anulado && !esCompra && remito.en_ventana_24h ? (
                    <button
                      type="button"
                      onClick={() => setUnidadParaReemplazo(u)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-surface-secondary text-content-primary rounded text-[11px] font-semibold border border-stroke transition-colors duration-150"
                      title="Reemplazar unidad en remito"
                    >
                      <RefreshCw size={11} className="text-brand-hover" />
                      <span>Reemplazar</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-success">
                      Registrado
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setUnicodeTrazabilidad(u.unicode)}
                    className="font-mono text-xs text-blue-600 hover:text-brand-hover hover:underline font-semibold cursor-pointer"
                    title="Ver historial de trazabilidad"
                  >
                    #{u.unicode}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAnulacion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stroke rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2 mb-2">
              <AlertTriangle className="text-error" size={18} />
              Confirmar Anulación del Remito #{remito.nro}
            </h3>
            <p className="text-xs text-content-secondary mb-4">
              Esta acción revertirá las ubicaciones de stock o aplicará la baja
              lógica correspondiente según el origen del movimiento.
            </p>

            <form
              onSubmit={(e) => void handleAnular(e.nativeEvent)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-content-primary uppercase mb-1.5">
                  Motivo de Anulación (* Obligatorio)
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoAnula}
                  onChange={(e) => setMotivoAnula(e.target.value)}
                  placeholder="Detalle el motivo de la anulación..."
                  className="w-full bg-white border border-stroke rounded-md p-2.5 text-xs text-content-primary placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={procesandoAnula}
                  onClick={() => setModalAnulacion(false)}
                  className="px-3.5 py-2 bg-surface-secondary hover:bg-stroke text-content-primary rounded-md text-xs font-medium transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAnula}
                  className="px-3.5 py-2 bg-brand-hover hover:bg-brand-pressed text-white rounded-md text-xs font-semibold transition-colors duration-150 shadow-sm disabled:opacity-50"
                >
                  {procesandoAnula ? "Anulando..." : "Confirmar Anulación"}
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

      {unicodeTrazabilidad && (
        <ModalTrazabilidadUnidad
          key={unicodeTrazabilidad}
          unicode={unicodeTrazabilidad}
          onClose={() => setUnicodeTrazabilidad(null)}
        />
      )}
    </div>
  );
};

export default RemitoDetallePage;

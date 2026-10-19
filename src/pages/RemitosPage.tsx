import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  RotateCcw,
  Plus,
  CheckCircle2,
  Ban,
  Clock,
  Eye,
} from "lucide-react";
import { useRemitosStore } from "../stores/useRemitosStore";
import type { RemitoConsolidado } from "../types";
import { obtenerNombreSucursal } from '../lib/catalogos';

export const RemitosPage: React.FC = () => {
  const { remitos, loading, cargarRemitos, filtroTexto, setFiltroTexto } =
    useRemitosStore();
  const navigate = useNavigate();

  useEffect(() => {
    cargarRemitos().catch((error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Error al obtener remitos");
    });
  }, [cargarRemitos]);

  const remitosFiltrados = remitos.filter((r: RemitoConsolidado): boolean => {
    if (!filtroTexto.trim()) return true;
    const q = filtroTexto.toLowerCase().trim();
    return (
      r.nro.toString().includes(q) ||
      r.de_nombre.toLowerCase().includes(q) ||
      r.a_nombre.toLowerCase().includes(q) ||
      r.operador.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stroke pb-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight flex items-center gap-2">
            Gestión de Remitos
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Movimientos consolidados de compras y traslados entre sucursales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void cargarRemitos()}
            disabled={loading}
            className="p-2 bg-white hover:bg-surface-hover text-content-secondary hover:text-content-primary rounded-md border border-stroke transition-colors duration-150 disabled:opacity-50"
            title="Recargar listado"
          >
            <RotateCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/remitos/nuevo")}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-hover hover:bg-brand-pressed text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150"
          >
            <Plus size={15} />
            <span>Nuevo Remito</span>
          </button>
        </div>
      </div>

      <div className="flex items-center bg-white border border-stroke rounded-md px-3 py-1.5 max-w-sm">
        <Search size={15} className="text-content-secondary mr-2 shrink-0" />
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Buscar por número, sucursal u operador..."
          className="bg-transparent border-none text-xs text-content-primary placeholder-content-disabled focus:outline-none w-full"
        />
        {filtroTexto && (
          <button
            type="button"
            onClick={() => setFiltroTexto("")}
            className="text-[11px] text-content-secondary hover:text-content-primary ml-2"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-white border border-stroke rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-content-primary">
            <thead className="bg-surface-secondary border-b border-stroke text-[11px] uppercase text-content-secondary tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">N° Remito</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Origen</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4 text-center">Unidades</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-content-secondary"
                  >
                    <RotateCcw
                      className="animate-spin inline-block mr-2 text-brand-hover"
                      size={16}
                    />
                    Cargando remitos...
                  </td>
                </tr>
              ) : remitosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-content-secondary"
                  >
                    No se encontraron remitos con los criterios aplicados.
                  </td>
                </tr>
              ) : (
                remitosFiltrados.map((remito: RemitoConsolidado) => (
                  <tr
                    key={remito.nro}
                    className={`hover:bg-surface-hover transition-colors duration-150 ${
                      remito.es_anulado
                        ? "bg-[#FEE2E2]/30 text-content-secondary"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-content-primary">
                      #{remito.nro}
                    </td>

                    <td className="py-3 px-4 text-content-secondary">
                      {remito.fecha.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        "$3/$2/$1",
                      )}
                    </td>

                    {/* 1. Columna Origen: Muestra solo el nombre descriptivo (ej. "Compras") */}
                    <td className="py-3 px-4 font-medium text-content-primary">
                      {remito.de_nombre || obtenerNombreSucursal(remito.de) || "Desconocido"}
                    </td>

                    {/* 2. Columna Destino: Muestra solo la flecha y el nombre descriptivo (ej. "Casa Central") */}
                    <td className="py-3 px-4 font-medium text-content-primary">
                      <div className="flex items-center gap-1.5">
                        <span>{remito.a_nombre || obtenerNombreSucursal(remito.a) || "Desconocido"}</span>
                      </div>
                    </td>

                    {/* 3. Columna Unidades: Formateado como entero exacto sin decimales (ej. 1) */}
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className="inline-block px-2 py-0.5 bg-surface-secondary border border-stroke rounded text-[11px] text-content-primary">
                        {Math.trunc(Number(remito.total_unidades) || 0)}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-content-secondary">
                      {remito.operador}
                    </td>

                    <td className="py-3 px-4">
                      {remito.es_anulado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-error/20">
                          <Ban size={10} />
                          Anulado
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-success-sofft text-success-dark border border-success/20">
                            <CheckCircle2 size={10} />
                            Activo
                          </span>
                          {remito.en_ventana_24h && (
                            <span
                              className="text-warning"
                              title="Dentro de ventana de 24h para edición/anulación"
                            >
                              <Clock size={12} />
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/remitos/${remito.nro}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-surface-secondary text-content-primary text-[11px] font-semibold rounded border border-stroke transition-colors duration-150 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RemitosPage;

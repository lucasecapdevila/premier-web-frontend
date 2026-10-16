import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Search, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Ban, 
  Clock, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { useRemitosStore } from '../stores/useRemitosStore';
import type { RemitoConsolidado } from '../types';

export const RemitosPage: React.FC = () => {
  const { remitos, loading, cargarRemitos, filtroTexto, setFiltroTexto } = useRemitosStore();
  const navigate = useNavigate();

  useEffect(() => {
    cargarRemitos().catch((error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Error al obtener remitos');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            Gestión de Remitos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Movimientos consolidados de compras y traslados de unidades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void cargarRemitos()}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            title="Recargar datos"
          >
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/remitos/nuevo')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Remito</span>
          </button>
        </div>
      </div>

      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 max-w-md">
        <Search size={16} className="text-slate-500 mr-2.5 shrink-0" />
        <input
          type="text"
          value={filtroTexto}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroTexto(e.target.value)}
          placeholder="Buscar por remito, origen, destino u operador..."
          className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {filtroTexto && (
          <button
            type="button"
            onClick={() => setFiltroTexto('')}
            className="text-xs text-slate-400 hover:text-white ml-2"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 border-b border-slate-700/60 text-xs uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">N° Remito</th>
                <th className="py-3.5 px-4 font-semibold">Fecha</th>
                <th className="py-3.5 px-4 font-semibold">Origen</th>
                <th className="py-3.5 px-4 font-semibold">Destino</th>
                <th className="py-3.5 px-4 font-semibold text-center">Unidades</th>
                <th className="py-3.5 px-4 font-semibold">Operador</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RotateCcw className="animate-spin inline-block mr-2" size={18} />
                    Cargando remitos...
                  </td>
                </tr>
              ) : remitosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No se encontraron remitos con los criterios aplicados.
                  </td>
                </tr>
              ) : (
                remitosFiltrados.map((remito: RemitoConsolidado) => (
                  <tr
                    key={remito.nro}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      remito.es_anulado ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{remito.nro}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {remito.fecha.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200">{remito.de_nombre}</span>
                      <span className="text-xs text-slate-500 ml-1.5 font-mono">({remito.de})</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight size={13} className="text-slate-600" />
                        <span className="font-medium text-slate-200">{remito.a_nombre}</span>
                        <span className="text-xs text-slate-500 font-mono">({remito.a})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {remito.total_unidades}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {remito.operador}
                    </td>

                    <td className="py-3.5 px-4">
                      {remito.es_anulado ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900/40 text-red-400 border border-red-800/60">
                          <Ban size={11} />
                          Anulado
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-800/60">
                            <CheckCircle2 size={11} />
                            Activo
                          </span>
                          {remito.en_ventana_24h && (
                            <span
                              className="text-amber-400 hover:text-amber-300 transition-colors"
                              title="Dentro de ventana de 24h para edición/anulación"
                            >
                              <Clock size={13} />
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/remitos/${remito.nro}`)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-md border border-slate-700 transition-all"
                      >
                        <Eye size={13} />
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
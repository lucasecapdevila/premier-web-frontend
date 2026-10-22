import { useEffect, useState } from 'react';
import type { TrazabilidadUnidadResponse, EventoTrazabilidad } from '../../types/trazabilidad';
import { getTrazabilidadUnidad } from '../../services/unidades.service';

interface Props {
  unicode: number | null;
  onClose: () => void;
}

export function ModalTrazabilidadUnidad({ unicode, onClose }: Props) {
  const [data, setData] = useState<TrazabilidadUnidadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!unicode) return;

  let isMounted = true;

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTrazabilidadUnidad(unicode);
      if (isMounted) {
        setData(res);
      }
    } catch (err: unknown) {
      if (isMounted) {
        const mensaje = err instanceof Error ? err.message : 'Error al cargar trazabilidad';
        setError(mensaje);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  void cargarDatos();

  return () => {
    isMounted = false;
  };
}, [unicode]);

  if (!unicode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded bg-white shadow-xl border border-stroke flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 bg-canvas">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Historial de Unidad{' '}
              <span className="font-mono text-sm bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                #{unicode}
              </span>
            </h2>
            {data && (
              <p className="text-xs text-gray-600 mt-1">
                {data.unidad_actual.descripcion} | Sucursal actual: <strong>{data.unidad_actual.sucursal_nombre}</strong>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Línea temporal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-500">
              Cargando eventos de trazabilidad...
            </div>
          )}

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && (
            <div className="relative border-l-2 border-gray-200 ml-4 pl-4 space-y-6">
              {data.eventos.map((ev: EventoTrazabilidad) => (
                <div key={`${ev.tipo}-${ev.id}`} className="relative group">
                  {/* Nodo visual */}
                  <div className="absolute -left-6.25 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-400 group-hover:bg-brand-hover transition-colors" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-mono font-medium text-gray-700">
                      {ev.fecha} {ev.hora}
                    </span>
                    <span>Operador: <strong>{ev.operador}</strong></span>
                  </div>

                  <div className="rounded border border-stroke bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          ev.tipo === 'ALTA'
                            ? 'bg-green-100 text-green-800'
                            : ev.tipo === 'TRASLADO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ev.tipo}
                      </span>
                      {ev.remito && (
                        <span className="text-xs font-mono text-gray-600">
                          Remito #{ev.remito}
                        </span>
                      )}
                    </div>

                    {(ev.tipo === 'ALTA' || ev.tipo === 'TRASLADO') && (
                      <div className="text-xs space-y-1">
                        <div className="text-gray-700">
                          Trayecto: <strong>{ev.origen_nombre}</strong> &rarr; <strong>{ev.destino_nombre}</strong>
                        </div>
                        <div className="font-mono text-gray-600 text-[11px]">
                          Motor: {ev.detalles.motor} | Chasis: {ev.detalles.chasis} | Color: {ev.detalles.color_nombre}
                        </div>
                      </div>
                    )}

                    {ev.tipo === 'RECTIFICACION' && (
                      <div className="text-xs space-y-2">
                        {ev.detalles.motivo && (
                          <p className="text-gray-600 italic">
                            &quot;{ev.detalles.motivo}&quot;
                          </p>
                        )}
                        {ev.detalles.cambios && ev.detalles.cambios.length > 0 && (
                          <div className="border-t border-gray-100 pt-2 space-y-1">
                            {ev.detalles.cambios.map((c, idx) => (
                              <div key={idx} className="font-mono text-[11px] text-gray-700">
                                <span className="font-semibold">{c.campo}:</span>{' '}
                                <span className="text-red-600 line-through">{c.anterior || '(vacío)'}</span>{' '}
                                &rarr;{' '}
                                <span className="text-green-700 font-bold">{c.nuevo}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cierre */}
        <div className="border-t border-stroke px-6 py-3 bg-canvas flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-stroke rounded hover:bg-gray-50 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getUnidadesDisponiblesReemplazo,
  reemplazarUnidadRemito,
} from '../../services/remitos.service';
import type {
  UnidadDisponibleReemplazo,
  UnidadRemitoSeleccionada,
} from '../../types/remitos';
import { ModalTrazabilidadUnidad } from '../unidades/ModalTrazabilidadUnidad';

interface Props {
  numeroRemito: number;
  origenNombre: string;
  destinoNombre: string;
  unidadSaliente: UnidadRemitoSeleccionada | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalReemplazarUnidad({
  numeroRemito,
  origenNombre,
  destinoNombre,
  unidadSaliente,
  onClose,
  onSuccess,
}: Props) {
  const [disponibles, setDisponibles] = useState<UnidadDisponibleReemplazo[]>([]);
  const [cargandoDisponibles, setCargandoDisponibles] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [unicodeEntrante, setUnicodeEntrante] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [unicodeTrazabilidad, setUnicodeTrazabilidad] = useState<number | null>(null);

  useEffect(() => {
    if (!unidadSaliente) return;

    let isMounted = true;

    const cargarDisponibles = async () => {
      try {
        setCargandoDisponibles(true);
        setErrorCarga(null);
        setUnicodeEntrante(null);

        const data = await getUnidadesDisponiblesReemplazo(
          numeroRemito,
          unidadSaliente.codart,
        );

        if (isMounted) {
          setDisponibles(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Error al obtener unidades disponibles en origen';
          setErrorCarga(msg);
        }
      } finally {
        if (isMounted) {
          setCargandoDisponibles(false);
        }
      }
    };

    void cargarDisponibles();

    return () => {
      isMounted = false;
    };
  }, [numeroRemito, unidadSaliente]);

  if (!unidadSaliente) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!unicodeEntrante) {
      setErrorEnvio('Debe seleccionar una unidad entrante desde el stock de origen');
      return;
    }

    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) {
      setErrorEnvio('El motivo de reemplazo es obligatorio');
      return;
    }

    try {
      setEnviando(true);
      setErrorEnvio(null);

      await reemplazarUnidadRemito(numeroRemito, {
        codart: unidadSaliente.codart,
        unicode_saliente: unidadSaliente.unicode,
        unicode_entrante: unicodeEntrante,
        motivo: motivoLimpio,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error inesperado al ejecutar el reemplazo';
      setErrorEnvio(errorMsg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl rounded bg-white shadow-2xl border border-stroke flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stroke px-6 py-4 bg-canvas">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Reemplazo Transaccional de Unidad
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Remito de Traslado #{numeroRemito} ({origenNombre} &rarr; {destinoNombre})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none cursor-pointer disabled:opacity-50"
            >
              &times;
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Unidad Saliente */}
              <div className="rounded border border-red-200 bg-red-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                    Unidad Saliente (Vuelve a {origenNombre})
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnicodeTrazabilidad(unidadSaliente.unicode)}
                    className="font-mono text-xs font-semibold text-blue-700 hover:text-brand-hover hover:underline cursor-pointer"
                    title="Ver historial de trazabilidad"
                  >
                    #{unidadSaliente.unicode}
                  </button>
                </div>

                <div className="text-xs text-gray-700">
                  <span className="font-medium">Artículo:</span> {unidadSaliente.codart} -{' '}
                  {unidadSaliente.descripcion || 'Sin descripción'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-600 bg-white p-2 rounded border border-red-100">
                  <div>
                    <span className="font-semibold text-gray-500 font-sans">Motor:</span>{' '}
                    {unidadSaliente.motor}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 font-sans">Chasis:</span>{' '}
                    {unidadSaliente.chasis}
                  </div>
                  {unidadSaliente.color_nombre && (
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-500 font-sans">Color:</span>{' '}
                      {unidadSaliente.color_nombre}
                    </div>
                  )}
                </div>
              </div>

              {/* Selector Unidad Entrante */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Unidad Entrante Disponible en {origenNombre} (*)
                </label>

                {cargandoDisponibles && (
                  <div className="py-4 text-center text-xs text-gray-500 italic">
                    Buscando stock disponible en sucursal de origen...
                  </div>
                )}

                {errorCarga && (
                  <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    {errorCarga}
                  </div>
                )}

                {!cargandoDisponibles && !errorCarga && disponibles.length === 0 && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    No hay otras unidades activas de este artículo disponibles en {origenNombre} para
                    efectuar el reemplazo.
                  </div>
                )}

                {!cargandoDisponibles && disponibles.length > 0 && (
                  <div className="border border-stroke rounded max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-canvas border-b border-stroke text-gray-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center">Sel.</th>
                          <th className="px-3 py-2">Unicode</th>
                          <th className="px-3 py-2">Motor</th>
                          <th className="px-3 py-2">Chasis</th>
                          <th className="px-3 py-2">Color</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke">
                        {disponibles.map((u) => {
                          const isSelected = unicodeEntrante === u.unicode;
                          return (
                            <tr
                              key={u.id}
                              onClick={() => setUnicodeEntrante(u.unicode)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="radio"
                                  name="unidadEntrante"
                                  checked={isSelected}
                                  onChange={() => setUnicodeEntrante(u.unicode)}
                                  className="accent-blue-600 cursor-pointer"
                                />
                              </td>
                              <td className="px-3 py-2 font-mono">
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    setUnicodeTrazabilidad(u.unicode);
                                  }}
                                  className="text-blue-600 hover:text-brand-hover hover:underline cursor-pointer"
                                  title="Ver historial antes de asignar"
                                >
                                  #{u.unicode}
                                </button>
                              </td>
                              <td className="px-3 py-2 font-mono text-gray-700">{u.motor}</td>
                              <td className="px-3 py-2 font-mono text-gray-700">{u.chasis}</td>
                              <td className="px-3 py-2 text-gray-600">{u.color_nombre}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Motivo */}
              <div className="space-y-1">
                <label
                  htmlFor="motivo-reemplazo"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Motivo del Reemplazo (*)
                </label>
                <textarea
                  id="motivo-reemplazo"
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Corrección por error de carga en depósito origen..."
                  required
                  disabled={enviando}
                  className="w-full rounded border border-stroke p-2 text-xs focus:border-blue-600 focus:outline-none resize-none disabled:bg-gray-100"
                />
              </div>

              {/* Error de Envío */}
              {errorEnvio && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorEnvio}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stroke px-6 py-3 bg-canvas flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={enviando}
                className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-stroke rounded hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || !unicodeEntrante || disponibles.length === 0}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {enviando ? 'Procesando Reemplazo...' : 'Confirmar Reemplazo'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Trazabilidad */}
      {unicodeTrazabilidad && (
        <ModalTrazabilidadUnidad
          key={unicodeTrazabilidad}
          unicode={unicodeTrazabilidad}
          onClose={() => setUnicodeTrazabilidad(null)}
        />
      )}
    </>
  );
}
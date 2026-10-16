import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  PackagePlus,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { SUCURSALES_OPCIONES, COLORES_OPCIONES } from '../lib/catalogos';
import type { 
  UnidadFormulario, 
  PayloadRemito, 
  PayloadUnidad, 
  RespuestaCrearRemito 
} from '../types';

export const NuevoRemitoPage: React.FC = () => {
  const navigate = useNavigate();

  const [origen, setOrigen] = useState<number>(90);
  const [destino, setDestino] = useState<number>(1);
  const [codart, setCodart] = useState<number>(2126);
  const [rubro, setRubro] = useState<number>(5);
  const [observa, setObserva] = useState<string>('');
  const [unidades, setUnidades] = useState<UnidadFormulario[]>([
    { motor: '', chasis: '', color: 'NGRO' },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOrigenChange = (nuevoOrigen: number): void => {
    setOrigen(nuevoOrigen);
    if (nuevoOrigen === 90) {
      setDestino(1);
    } else if (destino === nuevoOrigen) {
      setDestino(nuevoOrigen === 1 ? 2 : 1);
    }
  };

  const agregarFilaUnidad = (): void => {
    setUnidades((prev) => [...prev, { motor: '', chasis: '', color: 'NGRO' }]);
  };

  const quitarFilaUnidad = (index: number): void => {
    if (unidades.length === 1) {
      toast.error('El remito debe incluir al menos una unidad física');
      return;
    }
    setUnidades((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarUnidad = (
    index: number, 
    campo: keyof UnidadFormulario, 
    valor: string
  ): void => {
    setUnidades((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    if (origen === destino) {
      toast.error('El origen y destino no pueden ser iguales');
      return;
    }

    if (origen === 90 && destino !== 1) {
      toast.error('Para compras (origen 90), el destino debe ser Casa Central (1)');
      return;
    }

    if (rubro === 5) {
      for (let i = 0; i < unidades.length; i++) {
        if (!unidades[i].motor.trim() || !unidades[i].chasis.trim()) {
          toast.error(`La unidad #${i + 1} requiere Motor y Chasis para Rubro 5`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload: PayloadRemito = {
        origen,
        destino,
        items: [
          {
            codart: Number(codart),
            observa: observa.trim(),
            unidades: unidades.map((u): PayloadUnidad => ({
              motor: rubro === 5 ? u.motor.trim().toUpperCase() : undefined,
              chasis: rubro === 5 ? u.chasis.trim().toUpperCase() : undefined,
              color: u.color,
            })),
          },
        ],
      };

      const res = await api.post<RespuestaCrearRemito>('/remitos', payload);
      toast.success(`Remito #${res.data.remito} generado exitosamente`);
      navigate(`/remitos/${res.data.remito}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err.response?.data?.message ?? 'Error al procesar el remito';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/remitos')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <PackagePlus className="text-blue-500" size={24} />
              Generación de Remito
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Alta transaccional de compras y movimientos con secuencia oficial.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e.nativeEvent)} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Origen (* De)
            </label>
            <select
              value={origen}
              onChange={(e) => handleOrigenChange(Number(e.target.value))}
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUCURSALES_OPCIONES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Destino (* A)
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(Number(e.target.value))}
              disabled={loading || origen === 90}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {SUCURSALES_OPCIONES.filter((s) => s.id !== 90).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>
            {origen === 90 && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Info size={12} /> Para compras, el destino debe ser Casa Central (1)[cite: 160].
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Parámetros del Artículo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Código Artículo
              </label>
              <input
                type="number"
                required
                value={codart}
                onChange={(e) => setCodart(Number(e.target.value))}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rubro
              </label>
              <select
                value={rubro}
                onChange={(e) => setRubro(Number(e.target.value))}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>Rubro 5 (Motos - Motor/Chasis físicos)</option>
                <option value={13}>Rubro 13 (Bicicletas - Motor/Chasis = Unicode)</option>
                <option value={14}>Rubro 14 (Monopatines/Eléctricos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observación
              </label>
              <input
                type="text"
                value={observa}
                onChange={(e) => setObserva(e.target.value)}
                placeholder="Ej. Lote de fábrica 2026..."
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Padrón de Unidades ({unidades.length})
              </h2>
              <p className="text-xs text-slate-500">
                {rubro === 5 
                  ? 'Ingrese el número de motor y chasis físico para cada unidad.'
                  : 'Para Rubros 13 y 14 motor y chasis adoptan automáticamente el código asignado.'}
              </p>
            </div>
            <button
              type="button"
              onClick={agregarFilaUnidad}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Plus size={14} />
              <span>Añadir Unidad</span>
            </button>
          </div>

          <div className="space-y-3">
            {unidades.map((u, index) => (
              <div 
                key={index} 
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-1 text-center font-mono text-xs text-slate-500 font-bold">
                  #{index + 1}
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Motor"
                    value={u.motor}
                    onChange={(e) => actualizarUnidad(index, 'motor', e.target.value)}
                    disabled={loading || rubro !== 5}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                  />
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Chasis"
                    value={u.chasis}
                    onChange={(e) => actualizarUnidad(index, 'chasis', e.target.value)}
                    disabled={loading || rubro !== 5}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={u.color}
                    onChange={(e) => actualizarUnidad(index, 'color', e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {COLORES_OPCIONES.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => quitarFilaUnidad(index)}
                    disabled={loading || unidades.length === 1}
                    className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                    title="Eliminar fila"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/remitos')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCcw size={16} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Confirmar y Crear Remito</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoRemitoPage;
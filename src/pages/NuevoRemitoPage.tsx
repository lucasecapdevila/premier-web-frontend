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
  Info,
  Layers
} from 'lucide-react';
import { api } from '../lib/api';
import { SUCURSALES_OPCIONES, COLORES_OPCIONES, obtenerNombreSucursal } from '../lib/catalogos';
import { ModalSeleccionarUnidadesStock } from '../components/ModalSeleccionarUnidadesStock';
import type { 
  PayloadRemito, 
  PayloadUnidad, 
  RespuestaCrearRemito,
  UnidadDisponibleStock
} from '../types';

interface FilaUnidad {
  id?: number;
  unicode?: number;
  motor: string;
  chasis: string;
  color: string;
}

export const NuevoRemitoPage: React.FC = () => {
  const navigate = useNavigate();

  const [origen, setOrigen] = useState<number>(90);
  const [destino, setDestino] = useState<number>(1);
  const [codart, setCodart] = useState<number>(2126);
  const [rubro, setRubro] = useState<number>(5);
  const [observa, setObserva] = useState<string>('');
  const [unidades, setUnidades] = useState<FilaUnidad[]>([
    { motor: '', chasis: '', color: 'NGRO' },
  ]);
  const [modalStockOpen, setModalStockOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const esCompra = origen === 90;

  const handleOrigenChange = (nuevoOrigen: number): void => {
    setOrigen(nuevoOrigen);
    setUnidades([]);
    if (nuevoOrigen === 90) {
      setDestino(1);
      setUnidades([{ motor: '', chasis: '', color: 'NGRO' }]);
    } else {
      if (destino === nuevoOrigen) {
        setDestino(nuevoOrigen === 1 ? 2 : 1);
      }
    }
  };

  const agregarFilaManual = (): void => {
    setUnidades((prev) => [...prev, { motor: '', chasis: '', color: 'NGRO' }]);
  };

  const quitarFilaUnidad = (index: number): void => {
    setUnidades((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarFilaManual = (index: number, campo: keyof FilaUnidad, valor: string): void => {
    setUnidades((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleAgregarDesdeStock = (elegidas: UnidadDisponibleStock[]): void => {
    const nuevasFilas: FilaUnidad[] = elegidas.map((u) => ({
      id: u.id,
      unicode: u.unicode,
      motor: u.motor,
      chasis: u.chasis,
      color: u.color_codigo,
    }));
    setUnidades((prev) => [...prev, ...nuevasFilas]);
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

    if (unidades.length === 0) {
      toast.error('Debe incluir al menos una unidad en el remito');
      return;
    }

    if (esCompra && rubro === 5) {
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
            unidades: unidades.map((u): PayloadUnidad => {
              if (esCompra) {
                return {
                  motor: rubro === 5 ? u.motor.trim().toUpperCase() : undefined,
                  chasis: rubro === 5 ? u.chasis.trim().toUpperCase() : undefined,
                  color: u.color,
                };
              }
              return {
                id: u.id,
                color: u.color,
              };
            }),
          },
        ],
      };

      const res = await api.post<RespuestaCrearRemito>('/remitos', payload);
      toast.success(`Remito #${res.data.remito} generado exitosamente`);
      navigate(`/remitos/${res.data.remito}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Error al procesar el remito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-stroke pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/remitos')}
            className="p-1.5 bg-white hover:bg-surface-secondary text-content-secondary hover:text-content-primary rounded-md border border-stroke transition-colors duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary tracking-tight flex items-center gap-2">
              Generación de Remito
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              {esCompra ? 'Alta directa desde proveedor (Compra)' : 'Movimiento de inventario entre sucursales'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e.nativeEvent)} className="space-y-5">
        <div className="bg-white border border-stroke rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase mb-1.5">
              Origen (* De)
            </label>
            <select
              value={origen}
              onChange={(e) => handleOrigenChange(Number(e.target.value))}
              disabled={loading}
              className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
            >
              {SUCURSALES_OPCIONES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase mb-1.5">
              Destino (* A)
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(Number(e.target.value))}
              disabled={loading || esCompra}
              className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light disabled:bg-surface-secondary disabled:text-content-disabled"
            >
              {SUCURSALES_OPCIONES.filter((s) => s.id !== 90).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>
            {esCompra && (
              <p className="text-[11px] text-content-secondary mt-1 flex items-center gap-1">
                <Info size={11} className="text-warning" /> Para compras, el destino debe ser Casa Central (1).
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-stroke rounded-lg p-4 space-y-3 shadow-sm">
          <h2 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Parámetros del Artículo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Código Artículo
              </label>
              <input
                type="number"
                required
                value={codart}
                onChange={(e) => {
                  setCodart(Number(e.target.value));
                  if (!esCompra) setUnidades([]);
                }}
                disabled={loading}
                className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary font-mono focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Rubro
              </label>
              <select
                value={rubro}
                onChange={(e) => setRubro(Number(e.target.value))}
                disabled={loading}
                className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
              >
                <option value={5}>Rubro 5 (Motos - Motor/Chasis físicos)</option>
                <option value={13}>Rubro 13 (Bicicletas - Motor/Chasis = Unicode)</option>
                <option value={14}>Rubro 14 (Monopatines/Eléctricos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Observación
              </label>
              <input
                type="text"
                value={observa}
                onChange={(e) => setObserva(e.target.value)}
                placeholder="Ej. Traslado programado..."
                disabled={loading}
                className="w-full bg-white border border-stroke rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stroke rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
                Padrón de Unidades ({unidades.length})
              </h2>
              <p className="text-[11px] text-content-secondary">
                {esCompra
                  ? 'Carga de unidades nuevas para ingreso al stock.'
                  : `Seleccione unidades existentes en ${obtenerNombreSucursal(origen)}.`}
              </p>
            </div>

            {esCompra ? (
              <button
                type="button"
                onClick={agregarFilaManual}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary hover:bg-stroke text-content-primary text-xs font-semibold rounded-md transition-colors duration-150"
              >
                <Plus size={13} />
                <span>Añadir Fila</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalStockOpen(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-hover hover:bg-brand-pressed text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150"
              >
                <Layers size={13} />
                <span>Seleccionar del Stock ({obtenerNombreSucursal(origen)})</span>
              </button>
            )}
          </div>

          {unidades.length === 0 ? (
            <div className="p-6 bg-surface-hover border border-stroke rounded-md text-center text-xs text-content-secondary">
              No hay unidades cargadas en este remito.
            </div>
          ) : (
            <div className="space-y-2">
              {unidades.map((u, index) => (
                <div 
                  key={index} 
                  className="p-2.5 bg-surface-hover border border-stroke rounded-md grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-1 text-center font-mono text-xs text-content-secondary font-bold">
                    {u.unicode ? `#${u.unicode}` : `#${index + 1}`}
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Motor"
                      value={u.motor}
                      readOnly={!esCompra}
                      onChange={(e) => actualizarFilaManual(index, 'motor', e.target.value)}
                      disabled={loading || (esCompra && rubro !== 5)}
                      className={`w-full bg-white border border-stroke rounded p-1.5 text-xs text-content-primary font-mono placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light ${
                        !esCompra ? 'bg-surface-secondary cursor-default' : ''
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Chasis"
                      value={u.chasis}
                      readOnly={!esCompra}
                      onChange={(e) => actualizarFilaManual(index, 'chasis', e.target.value)}
                      disabled={loading || (esCompra && rubro !== 5)}
                      className={`w-full bg-white border border-stroke rounded p-1.5 text-xs text-content-primary font-mono placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light ${
                        !esCompra ? 'bg-surface-secondary cursor-default' : ''
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    {esCompra ? (
                      <select
                        value={u.color}
                        onChange={(e) => actualizarFilaManual(index, 'color', e.target.value)}
                        disabled={loading}
                        className="w-full bg-white border border-stroke rounded p-1.5 text-xs text-content-primary focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light"
                      >
                        {COLORES_OPCIONES.map((c) => (
                          <option key={c.codigo} value={c.codigo}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-2 py-1.5 rounded bg-surface-secondary text-xs text-content-primary border border-stroke w-full text-center">
                        {u.color}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => quitarFilaUnidad(index)}
                      disabled={loading}
                      className="p-1 text-content-secondary hover:text-error transition-colors duration-150"
                      title="Quitar fila"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/remitos')}
            className="px-4 py-2 bg-surface-secondary hover:bg-stroke text-content-primary rounded-md text-xs font-semibold transition-colors duration-150"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading || unidades.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-hover hover:bg-brand-pressed text-white font-semibold text-xs rounded-md shadow-sm transition-colors duration-150 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCcw size={14} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Confirmar y Crear Remito</span>
              </>
            )}
          </button>
        </div>
      </form>

      {modalStockOpen && (
        <ModalSeleccionarUnidadesStock
          sucursalId={origen}
          sucursalNombre={obtenerNombreSucursal(origen)}
          codart={codart}
          seleccionadasPreviamente={unidades.map((u) => u.id!).filter(Boolean)}
          onClose={() => setModalStockOpen(false)}
          onConfirmar={handleAgregarDesdeStock}
        />
      )}
    </div>
  );
};

export default NuevoRemitoPage;
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Check, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import type { ArticuloCatalogo } from '../types';

interface SelectorArticuloProps {
  codartSeleccionado: number;
  onSelectArticulo: (articulo: ArticuloCatalogo) => void;
  disabled?: boolean;
}

export const SelectorArticulo: React.FC<SelectorArticuloProps> = ({
  codartSeleccionado,
  onSelectArticulo,
  disabled = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownAbierto, setDropdownAbierto] = useState<boolean>(false);
  const [articuloActual, setArticuloActual] = useState<ArticuloCatalogo | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar artículo inicial si se proporciona un codart
  useEffect(() => {
    let activo = true;
    if (codartSeleccionado && (!articuloActual || articuloActual.codart !== codartSeleccionado)) {
      api.get<ArticuloCatalogo>(`/articulos/${codartSeleccionado}`)
        .then((res) => {
          if (activo) {
            setArticuloActual(res.data);
            setQuery(res.data.descripcion);
          }
        })
        .catch(() => {
          if (activo) {
            setArticuloActual(null);
            setQuery(String(codartSeleccionado));
          }
        });
    }
    return () => { activo = false; };
  }, [codartSeleccionado, articuloActual]);

  // Búsqueda con debounce al tipear
  useEffect(() => {
    if (!dropdownAbierto) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<ArticuloCatalogo[]>('/articulos', {
          params: { q: query.trim(), limit: 15 },
        });
        setArticulos(res.data);
      } catch {
        setArticulos([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, dropdownAbierto]);

  const handleSeleccionar = (art: ArticuloCatalogo) => {
    setArticuloActual(art);
    setQuery(art.descripcion);
    setDropdownAbierto(false);
    onSelectArticulo(art);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-semibold text-content-primary mb-1">
        Artículo (* Modelo / Catálogo)
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onFocus={() => setDropdownAbierto(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdownAbierto(true);
          }}
          placeholder="Buscar por código o modelo (ej. Wave, Blitz, 2126)..."
          className="w-full bg-white border border-stroke rounded-md pl-8 pr-8 py-2 text-xs text-content-primary placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light transition-colors"
        />
        <Search size={14} className="absolute left-2.5 top-2.5 text-content-secondary pointer-events-none" />

        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownAbierto((prev) => !prev)}
          className="absolute right-2 top-2 text-content-secondary hover:text-content-primary p-0.5 cursor-pointer"
        >
          {loading ? <Loader2 size={14} className="animate-spin text-brand-hover" /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Menú flotante de resultados */}
      {dropdownAbierto && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stroke rounded-md shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-stroke">
          {loading && articulos.length === 0 ? (
            <div className="p-3 text-center text-xs text-content-secondary flex items-center justify-center gap-2">
              <Loader2 size={13} className="animate-spin text-brand-hover" />
              <span>Consultando catálogo...</span>
            </div>
          ) : articulos.length === 0 ? (
            <div className="p-3 text-center text-xs text-content-secondary">
              No se encontraron artículos para "{query}".
            </div>
          ) : (
            articulos.map((art) => {
              const seleccionado = art.codart === codartSeleccionado;
              return (
                <div
                  key={art.codart}
                  onClick={() => handleSeleccionar(art)}
                  className={`p-2.5 hover:bg-surface-hover cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    seleccionado ? 'bg-surface-secondary font-medium' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-content-primary font-semibold">
                      {art.descripcion}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-content-secondary">
                      <span className="font-mono bg-canvas px-1.5 py-0.2 rounded border border-stroke">
                        Cód: #{art.codart}
                      </span>
                      <span>Rubro {art.rubro} {art.rubro === 5 ? '(Motos)' : art.rubro === 13 ? '(Bicicletas)' : '(Eléctricos)'}</span>
                    </div>
                  </div>

                  {seleccionado && <Check size={14} className="text-success shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
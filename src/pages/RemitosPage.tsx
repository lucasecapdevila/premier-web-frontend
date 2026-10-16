import React from 'react';

export const RemitosPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Módulo de Remitos</h1>
          <p className="text-sm text-slate-400">Consulta, alta de compras, traslados y reemplazos.</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Panel de Remitos listo para vincular la grilla consolidada.
      </div>
    </div>
  );
};

export default RemitosPage;
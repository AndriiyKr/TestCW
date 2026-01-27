import React from 'react';
import { 
  BarChart2, 
  Link2, 
  RotateCcw, 
  Zap, 
  Palette, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const GraphStats = ({ analysis, solutions, isDirected, onShowColoring }) => {
  if (!analysis) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Zap size={48} className="mb-4 opacity-20" />
      <p className="text-sm italic">Натисніть "Аналізувати", щоб отримати дані</p>
    </div>
  );

  const { degrees, is_regular, connectivity } = analysis;
  const { euler, hamilton, invariants } = solutions || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. СТЕПЕНІ ВЕРШИН */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <BarChart2 size={18} className="text-blue-500" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Степені вершин</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
              <tr>
                <th className="px-4 py-2">Вершина</th>
                {isDirected ? (
                  <>
                    <th className="px-4 py-2 text-center">In-deg</th>
                    <th className="px-4 py-2 text-center">Out-deg</th>
                  </>
                ) : (
                  <th className="px-4 py-2 text-center">Степінь</th>
                )}
              </tr>
            </thead>
            <tbody>
              {degrees.map((d, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2 font-bold text-slate-700">{d.label}</td>
                  {isDirected ? (
                    <>
                      <td className="px-4 py-2 text-center text-blue-600 font-mono">{d.in_degree}</td>
                      <td className="px-4 py-2 text-center text-indigo-600 font-mono">{d.out_degree}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-center font-mono text-slate-600">{d.degree}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-tighter">Статус регулярності:</span>
            {is_regular ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                <CheckCircle2 size={14} /> Регулярний
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 italic">Не регулярний</span>
            )}
          </div>
        </div>
      </section>

      {/* 2. ЗВ'ЯЗНІСТЬ */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={18} className="text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Зв'язність</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-lg font-black text-slate-800">{connectivity.components_count}</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Компонент</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-lg font-black text-emerald-600">{connectivity.vertex_connectivity}</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Вершинна κ(G)</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-lg font-black text-blue-600">{connectivity.edge_connectivity}</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Реберна λ(G)</div>
          </div>
        </div>
      </section>

      {/* 3. ЦИКЛИ (ЕЙЛЕР / ГАМІЛЬТОН) */}
      <section className="space-y-3">
        {/* Eulerian */}
        <div className="bg-slate-800 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ейлер</span>
            </div>
            {euler?.type !== 'none' && <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded-full">L={euler?.length}</span>}
          </div>
          <p className="text-sm font-medium mb-2">{euler?.message}</p>
          {euler?.path && euler.path.length > 0 && (
            <div className="text-xs font-mono bg-slate-700/50 p-2 rounded text-blue-200 break-all">
              {euler.path.join(' → ')}
            </div>
          )}
        </div>

        {/* Hamiltonian */}
        <div className="bg-indigo-900 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Гамільтон</span>
            </div>
            {hamilton?.path?.length > 0 && <span className="text-[10px] bg-amber-500 px-2 py-0.5 rounded-full font-bold">Знайдено</span>}
          </div>
          <p className="text-sm font-medium mb-2">{hamilton?.message}</p>
          {hamilton?.path && hamilton.path.length > 0 && (
            <div className="text-xs font-mono bg-slate-800/50 p-2 rounded text-amber-200 break-all">
              {hamilton.path.join(' → ')}
            </div>
          )}
        </div>
      </section>

      {/* 4. ІНВАРІАНТИ ТА РОЗФАРБУВАННЯ */}
      {invariants && (
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-fuchsia-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-fuchsia-500" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Інваріанти</h3>
            </div>
            <button 
              onClick={onShowColoring}
              className="text-[10px] font-bold bg-fuchsia-100 text-fuchsia-600 px-3 py-1 rounded-full hover:bg-fuchsia-600 hover:text-white transition-all active:scale-95"
            >
              ПОКАЗАТИ КОЛЬОРИ
            </button>
          </div>
          <div className="space-y-3">
            <InvariantRow label="Хроматичне число χ(G)" value={invariants.chromatic_number} color="text-fuchsia-600" />
            <InvariantRow label="Клікове число ω(G)" value={invariants.clique_number} color="text-orange-600" />
            <InvariantRow label="Число незалежності α(G)" value={invariants.independence_number} color="text-blue-600" />
          </div>
        </section>
      )}
    </div>
  );
};

const InvariantRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

export default GraphStats;
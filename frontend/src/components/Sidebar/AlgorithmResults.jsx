import React from 'react';
import { X, ArrowRight, Layers, ListOrdered } from 'lucide-react';

const AlgorithmResults = ({ result, type, onClear }) => {
  if (!result) return null;

  return (
    <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Заголовок результатів */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            {type === 'dijkstra' ? <ArrowRight size={18} /> : <Layers size={18} />}
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Результати: {type.toUpperCase()}
          </h3>
        </div>
        <button 
          onClick={onClear}
          className="text-slate-400 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-md"
          title="Приховати візуалізацію"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        {/* --- ВАРІАНТ ДЛЯ ДЕЙКСТРИ --- */}
        {type === 'dijkstra' && result.success && (
          <div className="space-y-4">
            <div className="bg-blue-600 p-4 rounded-xl text-white shadow-md shadow-blue-100">
              <div className="text-xs opacity-80 uppercase font-bold mb-1">Загальна вага шляху</div>
              <div className="text-3xl font-black">{result.total_weight}</div>
            </div>
            
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold mb-2 px-1">Послідовність вершин</div>
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                {result.path_nodes.map((nodeLabel, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm">
                      {nodeLabel}
                    </span>
                    {idx < result.path_nodes.length - 1 && (
                      <ArrowRight size={14} className="text-slate-300" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ВАРІАНТ ДЛЯ ПОМИЛОК --- */}
        {result.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            ⚠️ {result.error}
          </div>
        )}

        {/* --- ВАРІАНТ ДЛЯ DFS / BFS (ТАБЛИЦЯ ПРОТОКОЛУ) --- */}
        {(type === 'dfs' || type === 'bfs') && result.protocol && (
          <div className="overflow-x-auto">
            <div className="text-xs text-slate-500 uppercase font-bold mb-3 px-1 flex items-center gap-2">
              <ListOrdered size={14} /> Протокол обходу графа
            </div>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <thead>
                <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                  <th className="px-3 py-3 font-bold text-center">Вершина</th>
                  <th className="px-3 py-3 font-bold text-center">{type.toUpperCase()}-№</th>
                  <th className="px-3 py-3 font-bold">{type === 'dfs' ? 'Стек' : 'Черга'}</th>
                  <th className="px-3 py-3 font-bold">Ребро дерева</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {result.protocol.map((step, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-slate-50 hover:bg-blue-50/50 transition-colors ${
                      step.vertex === '—' ? 'text-slate-400 bg-slate-50/30' : 'text-slate-700'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-bold text-center border-r border-slate-50">
                      {step.vertex}
                    </td>
                    <td className="px-3 py-2.5 text-center border-r border-slate-50">
                      {step.dfs_num || step.bfs_num}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] border-r border-slate-50">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {Array.isArray(step.stack || step.queue) 
                          ? (step.stack || step.queue).join('') 
                          : (step.stack || step.queue)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 italic text-slate-500">
                      {step.tree_edge || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-slate-400 italic px-1">
              * Символ "—" означає крок повернення (backtracking) або видалення з черги.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmResults;
import React, { useState } from 'react';
import { 
  Settings2, 
  Play, 
  Database, 
  Info,
  Map as MapIcon,
  GitGraph
} from 'lucide-react';
import MatrixDisplay from './MatrixDisplay';
import GraphStats from './GraphStats';
import AlgorithmResults from './AlgorithmResults';

const Sidebar = ({ 
  nodes, 
  edges, 
  isDirected, 
  analysis, 
  solutions, 
  algoResult, 
  onRunAlgo, 
  onClearAlgo 
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');

  const nodeLabels = nodes.map(n => n.label);

  const handleRun = () => {
    if (!startNode) return alert("Оберіть початкову вершину!");
    
    // Знаходимо ID вершин на основі вибраних міток (Labels)
    const startId = nodes.find(n => n.label === startNode)?.id;
    const endId = nodes.find(n => n.label === endNode)?.id;

    onRunAlgo(selectedAlgo, { 
      start_node: startId, 
      end_node: endId 
    });
  };

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden">
      {/* Заголовок панелі */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
          <Settings2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Панель аналізу</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Graph Tool v1.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* БЛОК 1: Керування алгоритмами */}
        <section className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Play size={18} className="text-blue-400" />
              <h3 className="font-bold text-xs uppercase tracking-widest">Запуск алгоритмів</h3>
            </div>

            <div className="space-y-4">
              {/* Вибір алгоритму */}
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg">
                {['dijkstra', 'dfs', 'bfs'].map(algo => (
                  <button
                    key={algo}
                    onClick={() => setSelectedAlgo(algo)}
                    className={`py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                      selectedAlgo === algo ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>

              {/* Форма параметрів */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Старт</label>
                  <select 
                    value={startNode} 
                    onChange={(e) => setStartNode(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">—</option>
                    {nodeLabels.map(label => <option key={label} value={label}>{label}</option>)}
                  </select>
                </div>

                {selectedAlgo === 'dijkstra' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Кінець</label>
                    <select 
                      value={endNode} 
                      onChange={(e) => setEndNode(e.target.value)}
                      className="w-full bg-slate-800 border-none rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">—</option>
                      {nodeLabels.map(label => <option key={label} value={label}>{label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <button 
                onClick={handleRun}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                ЗАПУСТИТИ <GitGraph size={16} />
              </button>
            </div>
          </div>
          {/* Декоративний фон для блоку алгоритмів */}
          <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none">
            <MapIcon size={120} />
          </div>
        </section>

        {/* БЛОК 2: Результати виконання алгоритмів */}
        {algoResult && (
          <AlgorithmResults 
            type={selectedAlgo} 
            result={algoResult} 
            onClear={onClearAlgo} 
          />
        )}

        {/* БЛОК 3: Матриці */}
        <MatrixDisplay 
          adjMatrix={analysis?.adjacency_matrix} 
          incMatrix={analysis?.incidence_matrix} 
          nodeLabels={nodeLabels} 
        />

        {/* БЛОК 4: Загальна статистика */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Database size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Характеристики графа</h3>
          </div>
          <GraphStats 
            analysis={analysis} 
            solutions={solutions} 
            isDirected={isDirected} 
            onShowColoring={() => alert("Кольори вершин підсвічено!")} 
          />
        </section>

        {/* Підказка */}
        {!analysis && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 animate-pulse">
            <Info className="text-amber-500 shrink-0" size={20} />
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              Для отримання характеристик, матриць та розв'язання задач комівояжера, намалюйте граф та натисніть кнопку <strong>"Аналізувати"</strong> у верхній частині екрана.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
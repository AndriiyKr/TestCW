import React, { useState, useCallback } from 'react';
import GraphCanvas from './components/Canvas/GraphCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import { graphApi } from './services/api';

// Базові стилі для всього додатка
import './index.css';

function App() {
  // --- СТАН ГРАФА ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isDirected, setIsDirected] = useState(false);
  const [activeTool, setActiveTool] = useState('vertex');

  // --- СТАН ДАНИХ ТА АЛГОРИТМІВ ---
  const [analysis, setAnalysis] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [algoResult, setAlgoResult] = useState(null);

  // --- ПІДСВІТКА ---
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  // Функція для повного аналізу графа (Матриці + Цикли)
  const handleAnalyze = async () => {
    if (nodes.length === 0) return;
    try {
      // 1. Отримуємо базовий аналіз (матриці)
      const analysisData = await graphApi.analyze(nodes, edges, isDirected);
      setAnalysis(analysisData);

      // 2. Окремий запит на складні розрахунки (Ейлер/Гамільтон/Інваріанти)
      // Якщо він впаде, матриці все одно залишаться
      try {
        const solutionsData = await graphApi.solve(nodes, edges, isDirected);
        setSolutions(solutionsData);
      } catch (solveErr) {
        console.warn("Не вдалося розрахувати складні інваріанти:", solveErr);
        setSolutions({ error: "Деякі характеристики занадто складні для обчислення" });
      }
    } catch (err) {
      alert("Помилка зв'язку з сервером");
    }
  };

  // Запуск конкретного алгоритму (Дейкстра, DFS, BFS)
  const handleRunAlgorithm = async (type, params) => {
    try {
      let result;
      switch (type) {
        case 'dijkstra':
          result = await graphApi.runDijkstra(nodes, edges, isDirected, params.start_node, params.end_node);
          if (result.success) {
            // 1. Мапінг ID -> Мітки (labels) для відображення в списку
            result.path_nodes = result.path_nodes_ids.map(nodeId => {
              const foundNode = nodes.find(n => n.id === nodeId);
              return foundNode ? foundNode.label : `id:${nodeId}`;
            });

            // 2. Встановлюємо підсвітку для візуалізації на полотні
            setHighlightedNodes(result.path_nodes_ids);
            setHighlightedEdges(result.path_edges.map(e => e.id));
          }
          break;
        case 'dfs':
          result = await graphApi.runDFS(nodes, edges, isDirected, params.start_node);
          setHighlightedEdges(result.tree_edges.map(e => e.id));
          break;
        case 'bfs':
          result = await graphApi.runBFS(nodes, edges, isDirected, params.start_node);
          setHighlightedEdges(result.tree_edges.map(e => e.id));
          break;
        default:
          break;
      }
      setAlgoResult(result);
    } catch (err) {
      setAlgoResult({ error: err.error || "Помилка при виконанні алгоритму" });
    }
  };

  // Очищення підсвітки та результатів
  const clearAlgorithm = () => {
    setAlgoResult(null);
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  };

  // Очищення всього полотна
  const handleClearCanvas = () => {
    if (window.confirm("Ви впевнені, що хочете видалити весь граф?")) {
      setNodes([]);
      setEdges([]);
      setAnalysis(null);
      setSolutions(null);
      clearAlgorithm();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* ЛІВА ЧАСТИНА: Робоче поле */}
      <main className="relative flex-1 h-full p-4 flex flex-col">
        {/* Хедер полотна */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Graph Architect</h1>
            <p className="text-xs text-slate-400 font-medium">Малюйте графи та досліджуйте їх алгоритмічно</p>
          </div>
          
          <button 
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            АНАЛІЗУВАТИ ГРАФ
          </button>
        </div>

        {/* Полотно */}
        <div className="flex-1 relative">
          <GraphCanvas 
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isDirected={isDirected}
            setIsDirected={setIsDirected}
            highlightedNodes={highlightedNodes}
            highlightedEdges={highlightedEdges}
            onClear={handleClearCanvas}
          />
        </div>
      </main>

      {/* ПРАВА ЧАСТИНА: Сайдбар */}
      <div className="w-[400px] h-full shadow-2xl z-20 bg-white border-l border-slate-100">
        <Sidebar 
          nodes={nodes}
          edges={edges}
          isDirected={isDirected}
          analysis={analysis}
          solutions={solutions}
          algoResult={algoResult}
          onRunAlgo={handleRunAlgorithm}
          onClearAlgo={clearAlgorithm}
        />
      </div>
    </div>
  );
}

export default App;
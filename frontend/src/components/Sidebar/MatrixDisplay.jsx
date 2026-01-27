import React, { useState } from 'react';
import { Grid3X3, Table as TableIcon, ChevronRight, ChevronDown } from 'lucide-react';

const MatrixDisplay = ({ adjMatrix, incMatrix, nodeLabels }) => {
  const [activeTab, setActiveTab] = useState('adj'); // 'adj' або 'inc'
  const [isExpanded, setIsExpanded] = useState(true);

  if (!adjMatrix || adjMatrix.length === 0) return null;

  const renderMatrix = (matrix, labelsX, labelsY) => (
    <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/50">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 bg-slate-100 border-b border-r border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              V \ E
            </th>
            {labelsX.map((label, idx) => (
              <th key={idx} className="p-2 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 min-w-[32px]">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i} className="hover:bg-blue-50 transition-colors">
              <td className="p-2 bg-slate-100 border-r border-slate-200 text-[11px] font-bold text-slate-600">
                {labelsY[i]}
              </td>
              {row.map((val, j) => (
                <td 
                  key={j} 
                  className={`p-2 border-b border-r border-slate-100 text-sm font-medium ${
                    val !== 0 ? 'text-blue-600 bg-blue-50/30' : 'text-slate-300'
                  }`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Створюємо мітки для ребер матриці інцидентності (e1, e2...)
  const edgeLabels = incMatrix && incMatrix[0] 
    ? incMatrix[0].map((_, i) => `e${i + 1}`) 
    : [];

  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Заголовок з можливістю згортання */}
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
            <Grid3X3 size={18} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Матричне представлення</h3>
        </div>
        {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Перемикач табів */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('adj')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'adj' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableIcon size={14} /> Суміжності
            </button>
            <button
              onClick={() => setActiveTab('inc')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'inc' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableIcon size={14} /> Інцидентності
            </button>
          </div>

          {/* Відображення вибраної матриці */}
          {activeTab === 'adj' ? (
            <div>
              <p className="text-[11px] text-slate-400 mb-2 italic">Матриця розмірністю {nodeLabels.length}x{nodeLabels.length}</p>
              {renderMatrix(adjMatrix, nodeLabels, nodeLabels)}
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-slate-400 mb-2 italic">Матриця розмірністю {nodeLabels.length}x{edgeLabels.length}</p>
              {edgeLabels.length > 0 ? (
                renderMatrix(incMatrix, edgeLabels, nodeLabels)
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Додайте ребра, щоб побачити матрицю інцидентності
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatrixDisplay;
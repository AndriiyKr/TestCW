import React from 'react';

const Edge = ({ 
  edge, 
  nodes, 
  allEdges, 
  isHighlighted, 
  onClick, 
  activeTool 
}) => {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);

  if (!fromNode || !toNode) return null;

  // Знаходимо всі ребра між цією парою вершин (в обох напрямках)
  const parallelEdges = allEdges.filter(e => 
    (e.from === edge.from && e.to === edge.to) || 
    (e.from === edge.to && e.to === edge.from)
  );

  // Знаходимо індекс поточного ребра серед паралельних
  const edgeIndex = parallelEdges.findIndex(e => e.id === edge.id);
  
  // Розрахунок геометрії
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const dr = Math.sqrt(dx * dx + dy * dy);

  // Центр прямої лінії
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;

  let pathData;
  let labelX = midX;
  let labelY = midY;

  if (parallelEdges.length === 1) {
    // Пряма лінія, якщо ребро одне
    pathData = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
  } else {
    // Крива Безьє для кратних ребер
    // curveStep визначає наскільки сильно вигинається кожна наступна дуга
    const curveStep = 40; 
    const offset = curveStep * (edgeIndex - (parallelEdges.length - 1) / 2);
    
    // Обчислюємо контрольну точку, перпендикулярну до ребра
    const qx = midX + (offset * dy) / dr;
    const qy = midY - (offset * dx) / dr;
    
    pathData = `M ${fromNode.x} ${fromNode.y} Q ${qx} ${qy} ${toNode.x} ${toNode.y}`;
    
    // Зміщуємо текст ваги до вершини дуги
    labelX = qx;
    labelY = qy;
  }

  // Колір та стиль залежно від стану
  const strokeColor = isHighlighted ? "#ef4444" : "#64748b";
  const strokeWidth = isHighlighted ? 4 : 2;
  const markerId = edge.isDirected 
    ? (isHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)") 
    : "";

  return (
    <g 
      className="group cursor-pointer" 
      onClick={() => onClick(edge.id)}
    >
      {/* Невидима товста лінія для легшого натискання мишкою */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="15"
        fill="none"
      />
      
      {/* Основне ребро */}
      <path
        id={`path-${edge.id}`}
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={markerId}
        className="transition-all duration-300 group-hover:stroke-blue-400"
      />

      {/* Контейнер для ваги ребра */}
      {edge.weight !== undefined && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-10" y="-10"
            width="20" height="20"
            fill="white"
            fillOpacity="0.8"
            rx="4"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-[10px] font-bold select-none ${
              isHighlighted ? "fill-red-600" : "fill-slate-600"
            }`}
          >
            {edge.weight}
          </text>
        </g>
      )}
    </g>
  );
};

export default Edge;
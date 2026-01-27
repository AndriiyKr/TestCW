import React from 'react';

const Node = ({ 
  node, 
  isHighlighted, 
  onMouseDown, 
  onMouseUp, 
  activeTool 
}) => {
  // Радіус вершини
  const radius = 22;

  // Динамічні стилі залежно від стану
  const getColors = () => {
    if (isHighlighted) {
      return {
        fill: "#ef4444", // Червоний для алгоритмів
        stroke: "#b91c1c",
        text: "white"
      };
    }
    return {
      fill: "white",
      stroke: "#1e293b", // Темно-синій/чорний для звичайного стану
      text: "#1e293b"
    };
  };

  const colors = getColors();

  return (
    <g 
      className={`select-none transition-transform duration-200 ${
        activeTool === 'select' ? 'cursor-move' : 'cursor-pointer'
      } active:scale-95`}
      onMouseDown={(e) => {
        e.stopPropagation(); // Щоб клік по вершині не створював нову вершину на полотні
        onMouseDown(node.id);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        onMouseUp(node.id);
      }}
    >
      {/* Тінь для ефекту "пливучої" вершини */}
      <circle
        cx={node.x}
        cy={node.y + 2}
        r={radius}
        fill="rgba(0,0,0,0.1)"
      />

      {/* Основне коло вершини */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="2.5"
        className="transition-colors duration-300"
      />

      {/* Текст назви вершини */}
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        className="text-xs font-bold pointer-events-none tracking-tighter"
      >
        {node.label}
      </text>

      {/* Додаткове візуальне кільце при наведенні (активне лише для інструментів зв'язку) */}
      {(activeTool === 'edge' || activeTool === 'arc') && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 6}
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="opacity-0 hover:opacity-100 transition-opacity duration-200"
        />
      )}
    </g>
  );
};

export default Node;
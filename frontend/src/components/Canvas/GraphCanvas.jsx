import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, Circle, ArrowRight, Minus, Type, Weight } from 'lucide-react';

const GraphCanvas = ({ 
  nodes, setNodes, 
  edges, setEdges, 
  activeTool, setActiveTool, 
  isDirected, setIsDirected,
  highlightedNodes = [],
  highlightedEdges = []
}) => {
  const svgRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Отримання координат миші відносно SVG
  const getCoords = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCoords(e);
    const targetNode = nodes.find(n => 
      Math.hypot(n.x - coords.x, n.y - coords.y) < 20
    );
    
    const clickedNode = nodes.find(n => Math.hypot(n.x - coords.x, n.y - coords.y) < 22);

  // ЛОГІКА ВИДАЛЕННЯ
    if (activeTool === 'eraser') {
      if (clickedNode) {
        setNodes(nodes.filter(n => n.id !== clickedNode.id));
        setEdges(edges.filter(edge => edge.from !== clickedNode.id && edge.to !== clickedNode.id));
      } else {
        // Видалення ребра при кліку по ньому (спрощено)
        const clickedEdge = edges.find(edge => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return false;
          const d = distToSegment(coords, from, to);
          return d < 10;
        });
        if (clickedEdge) setEdges(edges.filter(edge => edge.id !== clickedEdge.id));
      }
      return;
    }
    if (activeTool === 'vertex' && !targetNode) {
      const newNode = {
        id: Date.now(),
        x: coords.x,
        y: coords.y,
        label: `v${nodes.length}`,
        color: '#1e293b'
      };
      setNodes([...nodes, newNode]);
    } else if (targetNode) {
      if (activeTool === 'edge' || activeTool === 'arc') {
        setConnectionStart(targetNode);
      } else if (activeTool === 'select') {
        setDraggedNode(targetNode.id);
      } else if (activeTool === 'label') {
        const newLabel = prompt("Введіть назву вершини:", targetNode.label);
        if (newLabel) {
          setNodes(nodes.map(n => n.id === targetNode.id ? { ...n, label: newLabel } : n));
        }
      }
    }
  };

  function distToSegment(p, v, w) {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  const handleMouseMove = (e) => {
    const coords = getCoords(e);
    setMousePos(coords);

    if (draggedNode && activeTool === 'select') {
      setNodes(nodes.map(n => n.id === draggedNode ? { ...n, x: coords.x, y: coords.y } : n));
    }
  };

  const handleMouseUp = (e) => {
    const coords = getCoords(e);
    const targetNode = nodes.find(n => 
      Math.hypot(n.x - coords.x, n.y - coords.y) < 20
    );

    if (connectionStart && targetNode && connectionStart.id !== targetNode.id) {
      const newEdge = {
        id: Date.now(),
        from: connectionStart.id,
        to: targetNode.id,
        weight: 1,
        isDirected: activeTool === 'arc'
      };
      setEdges([...edges, newEdge]);
    }

    setDraggedNode(null);
    setConnectionStart(null);
  };

  const handleEdgeClick = (edgeId) => {
    if (activeTool === 'weight') {
      const edge = edges.find(e => e.id === edgeId);
      const newWeight = prompt("Введіть вагу ребра (тільки додатні числа):", edge.weight);
      const parsedWeight = parseFloat(newWeight);
      if (!isNaN(parsedWeight) && parsedWeight > 0) {
        setEdges(edges.map(e => e.id === edgeId ? { ...e, weight: parsedWeight } : e));
      } else if (newWeight !== null) {
        alert("Вага має бути числом більшим за 0!");
      }
    }
  };

  // Функція для розрахунку шляху ребра (з урахуванням кратності)
  const getEdgePath = (edge, index) => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return "";

    const sameEdges = edges.filter(e => 
      (e.from === edge.from && e.to === edge.to) || 
      (e.from === edge.to && e.to === edge.from)
    );
    const edgeIndex = sameEdges.findIndex(e => e.id === edge.id);
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dr = Math.sqrt(dx * dx + dy * dy);

    // Якщо це єдине ребро між вузлами - малюємо пряму, інакше - дугу
    if (sameEdges.length === 1) {
      return `M${from.x},${from.y} L${to.x},${to.y}`;
    }

    const curve = 30 * (edgeIndex - (sameEdges.length - 1) / 2);
    // Квадратична крива Безьє
    const midX = (from.x + to.x) / 2 + (curve * dy) / dr;
    const midY = (from.y + to.y) / 2 - (curve * dx) / dr;

    return `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`;
  };

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      {/* Панель інструментів */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100 z-10">
        <ToolBtn active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={<MousePointer2 size={20}/>} title="Вибір/Перетягування" />
        <ToolBtn active={activeTool === 'vertex'} onClick={() => setActiveTool('vertex')} icon={<Circle size={20}/>} title="Додати вершину" />
        <ToolBtn 
          active={activeTool === 'edge'} 
          onClick={() => {setActiveTool('edge'); setIsDirected(false)}} 
          icon={<Minus size={20}/>} 
          title="Додати ребро" 
          disabled={isDirected && edges.length > 0}
        />
        <ToolBtn 
          active={activeTool === 'arc'} 
          onClick={() => {setActiveTool('arc'); setIsDirected(true)}} 
          icon={<ArrowRight size={20}/>} 
          title="Додати дугу" 
          disabled={!isDirected && edges.length > 0}
        />
        <div className="h-px bg-slate-200 my-1" />
        <ToolBtn active={activeTool === 'label'} onClick={() => setActiveTool('label')} icon={<Type size={20}/>} title="Назва вершини" />
        <ToolBtn active={activeTool === 'weight'} onClick={() => setActiveTool('weight')} icon={<Weight size={20}/>} title="Вага ребра" />
      </div>

      <svg 
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="18" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="18" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
        </defs>

        {/* Малювання ребер */}
        {edges.map((edge) => {
          const isHighlighted = highlightedEdges.includes(edge.id);
          return (
            <g key={edge.id} onClick={() => handleEdgeClick(edge.id)}>
              <path
                d={getEdgePath(edge)}
                stroke={isHighlighted ? "#ef4444" : "#94a3b8"}
                strokeWidth={isHighlighted ? 4 : 2}
                fill="none"
                markerEnd={edge.isDirected ? (isHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)") : ""}
                className="transition-all duration-300 cursor-pointer hover:stroke-blue-400"
              />
              {/* Відображення ваги по центру ребра */}
              <text
                dy="-5"
                className="text-[10px] font-bold fill-slate-500 select-none"
              >
                <textPath href={`#path-${edge.id}`} startOffset="50%" textAnchor="middle">
                  {edge.weight}
                </textPath>
              </text>
              <path id={`path-${edge.id}`} d={getEdgePath(edge)} fill="none" />
            </g>
          );
        })}

        {/* Лінія під час створення зв'язку */}
        {connectionStart && (
          <line 
            x1={connectionStart.x} y1={connectionStart.y} 
            x2={mousePos.x} y2={mousePos.y} 
            stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" 
          />
        )}

        {/* Малювання вершин */}
        {nodes.map((node) => {
          const isHighlighted = highlightedNodes.includes(node.id);
          return (
            <g key={node.id} className="cursor-pointer select-none">
              <circle
                cx={node.x} cy={node.y} r="18"
                fill={isHighlighted ? "#ef4444" : "white"}
                stroke={isHighlighted ? "#b91c1c" : "#1e293b"}
                strokeWidth="2"
                className="transition-colors duration-300 shadow-sm"
              />
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dy=".3em"
                className={`text-[12px] font-bold ${isHighlighted ? "fill-white" : "fill-slate-800"}`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon, title, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
    } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
  >
    {icon}
  </button>
);

export default GraphCanvas;
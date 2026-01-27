/**
 * Розрахунок відстані між двома точками
 */
export const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Розрахунок контрольної точки для квадратичної кривої Безьє.
 * Використовується для створення вигину кратних ребер.
 * * @param {Object} from - Координати старту {x, y}
 * @param {Object} to - Координати кінця {x, y}
 * @param {Number} index - Порядковий номер ребра серед паралельних
 * @param {Number} total - Загальна кількість ребер між цими вузлами
 */
export const getControlPoint = (from, to, index, total) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  if (total === 1) {
    return { x: midX, y: midY };
  }

  // Відстань між вершинами
  const dist = getDistance(from, to);
  
  // Вектор ребра
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Нормалізований перпендикулярний вектор
  const nx = -dy / dist;
  const ny = dx / dist;

  // Розрахунок зміщення (offset)
  // Чим більше ребер, тим сильніший вигин. 
  // Центральне ребро (якщо total непарне) буде майже прямим.
  const step = 40; 
  const offset = step * (index - (total - 1) / 2);

  return {
    x: midX + nx * offset,
    y: midY + ny * offset
  };
};

/**
 * Спеціальна функція для обрізки лінії ребра біля краю вершини.
 * Це потрібно, щоб стрілка дуги не заходила під коло вершини.
 */
export const getAdjustedPoints = (from, to, radius = 22) => {
  const dist = getDistance(from, to);
  if (dist === 0) return { from, to };

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Обчислюємо зміщення для точок початку і кінця на величину радіуса
  return {
    x1: from.x + (dx * radius) / dist,
    y1: from.y + (dy * radius) / dist,
    x2: to.x - (dx * radius) / dist,
    y2: to.y - (dy * radius) / dist
  };
};

/**
 * Генериує рядок атрибута 'd' для SVG path
 */
export const generatePathData = (from, to, controlPoint, isCurved) => {
  if (!isCurved) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  return `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`;
};
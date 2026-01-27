import axios from 'axios';

// Базова конфігурація для зв'язку з Django
const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Функція для підготовки даних перед відправкою.
 * Оскільки на фронтенді ми використовуємо об'єкти з координатами,
 * а бекенду потрібні лише зв'язки та мітки.
 */
const formatGraphData = (nodes, edges, isDirected) => {
  return {
    nodes: nodes.map(n => ({ id: n.id, label: n.label })),
    edges: edges.map(e => ({ 
      id: e.id, 
      from: e.from, 
      to: e.to, 
      weight: e.weight 
    })),
    is_directed: isDirected
  };
};

export const graphApi = {
  // 1. Отримання базових характеристик (матриці, степені, зв'язність)
  analyze: async (nodes, edges, isDirected) => {
    try {
      const response = await apiClient.post('/analyze/', formatGraphData(nodes, edges, isDirected));
      return response.data;
    } catch (error) {
      console.error("Помилка при аналізі графа:", error);
      throw error.response?.data || { error: "Сервер недоступний" };
    }
  },

  // 2. Складні розрахунки (Ейлер, Гамільтон, Хроматичне число)
  solve: async (nodes, edges, isDirected) => {
    try {
      const response = await apiClient.post('/solve/', formatGraphData(nodes, edges, isDirected));
      return response.data;
    } catch (error) {
      console.error("Помилка при розв'язанні задач графа:", error);
      throw error.response?.data || { error: "Помилка при пошуку циклів" };
    }
  },

  // 3. Алгоритм Дейкстри
  runDijkstra: async (nodes, edges, isDirected, startNode, endNode) => {
    try {
      const payload = {
        ...formatGraphData(nodes, edges, isDirected),
        start_node: startNode,
        end_node: endNode
      };
      const response = await apiClient.post('/dijkstra/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Помилка в алгоритмі Дейкстри" };
    }
  },

  // 4. Пошук вглиб (DFS)
  runDFS: async (nodes, edges, isDirected, startNode) => {
    try {
      const payload = {
        ...formatGraphData(nodes, edges, isDirected),
        start_node: startNode
      };
      const response = await apiClient.post('/traverse/dfs/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Помилка в алгоритмі DFS" };
    }
  },

  // 5. Пошук вшир (BFS)
  runBFS: async (nodes, edges, isDirected, startNode) => {
    try {
      const payload = {
        ...formatGraphData(nodes, edges, isDirected),
        start_node: startNode
      };
      const response = await apiClient.post('/traverse/bfs/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Помилка в алгоритмі BFS" };
    }
  }
};
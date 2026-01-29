import networkx as nx

class PathFinder:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        self.raw_edges = edges
        self.G = nx.MultiDiGraph() if is_directed else nx.MultiGraph()
        
        # 1. Сортуємо вузли за ID для стабільного порядку в матрицях (v1, v2, v3...)
        sorted_nodes = sorted(nodes, key=lambda x: x.get('id'))
        self.node_ids = [str(n['id']) for n in sorted_nodes]
        self.node_to_idx = {n_id: i for i, n_id in enumerate(self.node_ids)}
        self.idx_to_label = {i: n.get('label', f"v{i+1}") for i, n in enumerate(sorted_nodes)}

        for node in sorted_nodes:
            self.G.add_node(str(node['id']), label=node.get('label', f"v{node.get('id')}"))
            
        for edge in edges:
            # Використовуємо 1 як технічну вагу, якщо вона не задана
            w = float(edge.get('weight', 1))
            self.G.add_edge(
                str(edge['from']), 
                str(edge['to']), 
                weight=w, 
                edge_id=edge.get('id'),
                has_weight=edge.get('hasWeight', False)
            )

    def run_dijkstra(self, start_node, end_node):
        # ПЕРЕВІРКА: чи всі ребра мають встановлену вагу
        # Якщо в масиві edges хоча б в одного об'єкта hasWeight === false
        unweighted = [e for e in self.raw_edges if not e.get('hasWeight', False)]
        if unweighted:
            return {
                "success": False, 
                "error": f"Алгоритм Дейкстри неможливий: {len(unweighted)} ребер не мають встановленої ваги. Використайте інструмент 'Вага'."
            }
            
        # ПЕРЕВІРКА: наявність від'ємних ваг
        negative_edges = [e for e in self.raw_edges if float(e.get('weight', 0)) < 0]
        if negative_edges:
            return {
                "success": False,
                "error": "Алгоритм Дейкстри не працює з від'ємними вагами. Виправте ваги ребер."
            }

        try:
            start_node, end_node = str(start_node), str(end_node)
            
            if start_node == end_node:
                return {
                    "success": True,
                    "path_nodes_ids": [start_node],
                    "path_edges": [],
                    "total_weight": 0
                }
            
            path_nodes = nx.dijkstra_path(self.G, source=start_node, target=end_node, weight='weight')
            path_weight = nx.dijkstra_path_length(self.G, source=start_node, target=end_node, weight='weight')

            path_edges = []
            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i+1]
                edge_data = self.G.get_edge_data(u, v)
                # Обираємо ребро з найменшою вагою серед можливих між двома вузлами
                best_key = min(edge_data, key=lambda k: edge_data[k]['weight'])
                path_edges.append({
                    "from": u, "to": v, 
                    "id": edge_data[best_key].get('edge_id')
                })

            return {
                "success": True,
                "path_nodes_ids": path_nodes,
                "path_edges": path_edges,
                "total_weight": path_weight
            }
        except nx.NetworkXNoPath:
            return {"success": False, "error": "Шлях між обраними вершинами не існує."}
        except Exception as e:
            return {"success": False, "error": str(e)}
        
    def run_floyd_warshall(self):
        """Алгоритм Флойда-Воршелла з виправленою ініціалізацією та орієнтованістю"""
        n = len(self.node_ids)
        # M - матриця відстаней
        dist = [[float('inf')] * n for _ in range(n)]
        
        # Тета (T) ініціалізація: T[i][j] = i + 1 для всіх j != i, і 0 на діагоналі
        # Це відповідає вашому запиту: ((0,1,1,1), (2,0,2,2), (3,3,0,3), (4,4,4,0))
        pred = [[(i + 1) if i != j else 0 for j in range(n)] for i in range(n)]

        for i in range(n):
            dist[i][i] = 0

        # Початкове заповнення матриці відстаней M суворо за напрямком ребер
        # Для MultiDiGraph edges() повертає (u, v, data), де u -> v
        for u_id, v_id, data in self.G.edges(data=True):
            if u_id not in self.node_to_idx or v_id not in self.node_to_idx:
                continue

            u = self.node_to_idx[u_id]
            v = self.node_to_idx[v_id]
            w = data['weight']

            if w < dist[u][v]:
                dist[u][v] = w
                pred[u][v] = u + 1

        def get_snapshot(d_mat, p_mat):
            """Форматування матриць для фронтенду"""
            return {
                "M": [["∞" if x == float('inf') else (int(x) if x == int(x) else x) for x in row] for row in d_mat],
                "T": [[x for x in row] for row in p_mat]
            }

        # Крок 0: Початковий стан
        steps = [get_snapshot(dist, pred)]

        # Основний цикл Флойда
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    # Перевірка умови релаксації через вершину k
                    if dist[i][k] + dist[k][j] < dist[i][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        # Оновлення Тета: попередником j стає попередник j на шляху з k
                        pred[i][j] = pred[k][j]
            steps.append(get_snapshot(dist, pred))

        return {
            "success": True,
            "steps": steps,
            "labels": [self.idx_to_label[i] for i in range(n)],
            "node_ids": self.node_ids
        }

# Функції виклику для Django Views
def run_floyd(nodes, edges, is_directed):
    finder = PathFinder(nodes, edges, is_directed)
    return finder.run_floyd_warshall()

def run_dijkstra(nodes, edges, is_directed, start_node, end_node):
    finder = PathFinder(nodes, edges, is_directed)
    return finder.run_dijkstra(start_node, end_node)
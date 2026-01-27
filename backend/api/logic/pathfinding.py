import networkx as nx

class PathFinder:
    def __init__(self, nodes, edges, is_directed=False):
        """
        Ініціалізація графа.
        Використовуємо Multi-типи для підтримки кратних ребер.
        """
        self.is_directed = is_directed
        if is_directed:
            self.G = nx.MultiDiGraph()
        else:
            self.G = nx.MultiGraph()

        # Додаємо вершини
        for node in nodes:
            self.G.add_node(node['id'], label=node.get('label', f"v{node['id']}"))

        # Додаємо ребра з вагами та збереженням ID для візуалізації
        for edge in edges:
            weight = float(edge.get('weight', 1))
            self.G.add_edge(
                edge['from'], 
                edge['to'], 
                weight=weight, 
                edge_id=edge.get('id') # ID ребра з фронтенду для підсвітки
            )

    def validate_weights(self):
        """Перевіряє, чи всі ваги ребер є додатними."""
        for u, v, data in self.G.edges(data=True):
            if data['weight'] <= 0:
                return False, f"Ребро ({u}-{v}) має некоректну вагу {data['weight']}. Вага повинна бути > 0."
        return True, ""

    def run_dijkstra(self, start_node, end_node):
        """
        Виконує алгоритм Дейкстри.
        Повертає шлях, його загальну вагу та список ребер для підсвітки.
        """
        # 1. Валідація ваг
        is_valid, error_msg = self.validate_weights()
        if not is_valid:
            return {"error": error_msg}

        try:
            # 2. Розрахунок найкоротшого шляху
            # weight='weight' змушує nx враховувати ваги, MultiGraph обере мінімальне серед кратних
            path_nodes = nx.dijkstra_path(self.G, source=start_node, target=end_node, weight='weight')
            path_weight = nx.dijkstra_path_length(self.G, source=start_node, target=end_node, weight='weight')

            # 3. Визначення конкретних ребер (для підсвітки на фронтенді)
            path_edges = []
            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i+1]
                
                # Шукаємо ребро з мінімальною вагою між цими двома вершинами
                edge_data = self.G.get_edge_data(u, v)
                
                # Отримуємо ключ (індекс) ребра з найменшою вагою
                best_edge_key = min(edge_data, key=lambda k: edge_data[k]['weight'])
                path_edges.append({
                    "from": u,
                    "to": v,
                    "id": edge_data[best_edge_key].get('edge_id')
                })

            return {
                "success": True,
                "path_nodes": path_nodes,
                "path_edges": path_edges,
                "total_weight": path_weight,
                "message": f"Найкоротший шлях знайдено. Вага: {path_weight}"
            }

        except nx.NetworkXNoPath:
            return {
                "success": False,
                "error": f"Шлях між вершинами {start_node} та {end_node} не існує."
            }
        except nx.NodeNotFound as e:
            return {
                "success": False,
                "error": f"Одну з вершин не знайдено: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Помилка алгоритму: {str(e)}"
            }

    def get_all_shortest_paths_info(self, start_node):
        """
        Додатковий метод: повертає відстані від початкової вершини до всіх інших.
        Корисно для повної аналітики графа.
        """
        try:
            lengths = nx.single_source_dijkstra_path_length(self.G, start_node, weight='weight')
            return lengths
        except Exception:
            return {}
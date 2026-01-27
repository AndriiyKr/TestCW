import networkx as nx

class GraphSolvers:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        self.nodes_data = nodes
        if is_directed:
            self.G = nx.DiGraph()
        else:
            self.G = nx.Graph()

        for node in nodes:
            self.G.add_node(node['id'], label=node.get('label', f"v{node['id']}"))
        for edge in edges:
            self.G.add_edge(edge['from'], edge['to'], weight=float(edge.get('weight', 1)))

    def get_eulerian_info(self):
        """Пошук Ейлерового циклу або шляху."""
        result = {
            "type": "none",
            "path": [],
            "length": 0,
            "message": "Ейлерового шляху чи циклу не існує"
        }

        # Перевірка на Ейлерів цикл
        if nx.is_eulerian(self.G):
            circuit = list(nx.eulerian_circuit(self.G, source=next(iter(self.G.nodes)) if self.G.nodes else None))
            # Перетворюємо список ребер у послідовність вершин
            path_nodes = [u for u, v in circuit]
            path_nodes.append(circuit[0][0])
            
            result.update({
                "type": "cycle",
                "path": path_nodes,
                "length": len(circuit),
                "message": "Знайдено Ейлерів цикл"
            })
        # Перевірка на Ейлерів шлях
        elif nx.has_eulerian_path(self.G):
            path_edges = list(nx.eulerian_path(self.G))
            path_nodes = [u for u, v in path_edges]
            path_nodes.append(path_edges[-1][1])
            
            result.update({
                "type": "path",
                "path": path_nodes,
                "length": len(path_edges),
                "message": "Знайдено Ейлерів шлях"
            })
        
        return result

    def get_hamiltonian_info(self):
        """Пошук Гамільтонового циклу або шляху (обмеження до 10 вершин)."""
        num_nodes = self.G.number_of_nodes()
        if num_nodes > 10:
            return {"message": "Граф занадто великий для пошуку Гамільтонових шляхів (>10 вершин)", "path": []}
        if num_nodes == 0:
            return {"message": "Граф порожній", "path": []}

        def find_hamiltonian(is_cycle=True):
            # Використовуємо бектрекінг для пошуку
            nodes = list(self.G.nodes())
            for start_node in nodes:
                stack = [(start_node, [start_node])]
                while stack:
                    (curr, path) = stack.pop()
                    if len(path) == num_nodes:
                        if is_cycle:
                            if self.G.has_edge(path[-1], path[0]):
                                return path + [path[0]]
                        else:
                            return path
                    
                    for neighbor in self.G.neighbors(curr):
                        if neighbor not in path:
                            stack.append((neighbor, path + [neighbor]))
            return None

        cycle = find_hamiltonian(is_cycle=True)
        if cycle:
            return {"type": "cycle", "path": cycle, "length": len(cycle)-1, "message": "Знайдено Гамільтонів цикл"}
        
        path = find_hamiltonian(is_cycle=False)
        if path:
            return {"type": "path", "path": path, "length": len(path)-1, "message": "Знайдено Гамільтонів шлях"}
        
        return {"type": "none", "path": [], "message": "Гамільтонового шляху чи циклу не існує"}

    def get_graph_invariants(self):
        """Обчислення незалежності, клікового та хроматичного чисел."""
        # Ці метрики зазвичай рахуються для неорієнтованого графа
        undirected_G = self.G.to_undirected() if self.is_directed else self.G
        
        # 1. Хроматичне число та розфарбування (Greedy coloring)
        # Повертає словник {node_id: color_id}
        coloring_map = nx.coloring.greedy_color(undirected_G, strategy="largest_first")
        chromatic_number = max(coloring_map.values()) + 1 if coloring_map else 0

        # 2. Клікове число (розмір найбільшої повної підгрупи)
        # Використовуємо апроксимацію або точний пошук для малих графів
        clique_number = nx.graph_clique_number(undirected_G) if not undirected_G.is_directed() else 0
        
        # 3. Число незалежності (розмір найбільшої незалежної множини вершин)
        # В NetworkX це можна знайти через максимальну незалежну множину
        independent_set = nx.maximal_independent_set(undirected_G) if undirected_G.nodes else []
        # Примітка: maximal != maximum, але для навчальних цілей networkx дає добрий результат. 
        # Для точного числа незалежності використовуємо зв'язок з кліковим числом комплементарного графа:
        complement_G = nx.complement(undirected_G)
        independence_number = nx.graph_clique_number(complement_G) if complement_G.nodes else 0

        return {
            "chromatic_number": chromatic_number,
            "coloring_map": coloring_map,
            "clique_number": clique_number,
            "independence_number": independence_number
        }

    def get_all_solutions(self):
        """Зведення всіх результатів."""
        return {
            "euler": self.get_eulerian_info(),
            "hamilton": self.get_hamiltonian_info(),
            "invariants": self.get_graph_invariants()
        }
import networkx as nx
import numpy as np

class GraphAnalyzer:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        # ВИПРАВЛЕНО: Використовуємо Multi-типи для підтримки кратних ребер
        self.G = nx.MultiDiGraph() if is_directed else nx.MultiGraph()
        
        for node in nodes:
            self.G.add_node(str(node['id']), label=node.get('label', f"v{node['id']}"))
        
        for edge in edges:
            # Кожне крате ребро додається як окремий запис
            self.G.add_edge(str(edge['from']), str(edge['to']), weight=float(edge.get('weight', 1)))

    def get_adjacency_matrix(self):
        if not self.G.nodes: return []
        # nx.adjacency_matrix для MultiGraph повертає кількість ребер між i та j
        matrix = nx.adjacency_matrix(self.G, weight=None).todense()
        return matrix.tolist()

    def get_incidence_matrix(self):
        nodes = list(self.G.nodes())
        # Отримуємо всі ребра з ключами (для мультиграфів)
        edges = list(self.G.edges(keys=True))
        
        if not nodes or not edges: return []
        
        num_nodes = len(nodes)
        num_edges = len(edges)
        # Створюємо нульову матрицю: рядки - вершини, стовпці - ребра
        matrix = np.zeros((num_nodes, num_edges), dtype=int)
        
        # Карта для швидкого пошуку індексу рядка за ID вершини
        node_to_idx = {node_id: i for i, node_id in enumerate(nodes)}
        
        for j, (u, v, key) in enumerate(edges):
            u_idx = node_to_idx[u]
            v_idx = node_to_idx[v]
            
            if u == v:
                # ВИПРАВЛЕНО: Якщо це петля (u == v), пишемо 2 у слот вершини
                matrix[u_idx, j] = 2
            else:
                if self.is_directed:
                    # Для дуг: -1 (вихід), 1 (вхід)
                    matrix[u_idx, j] = -1
                    matrix[v_idx, j] = 1
                else:
                    # Для ребер: 1 для обох кінців
                    matrix[u_idx, j] = 1
                    matrix[v_idx, j] = 1
                    
        return matrix.tolist()
    
    def get_adjacency_list(self):
        adj_list = []
        # Сортуємо вершини за ID для стабільного виводу
        for n_id in sorted(self.G.nodes()):
            label = self.G.nodes[n_id].get('label', f"v{n_id}")
            # Отримуємо унікальних сусідів (для мультиграфів neighbors повертає набір вузлів)
            # Для орієнтованих графів neighbors() еквівалентний successors()
            neighbors = self.G.neighbors(n_id)
            neighbor_labels = [self.G.nodes[nb].get('label', nb) for nb in neighbors]
            
            adj_list.append({
                'vertex': label,
                'neighbors': ", ".join(neighbor_labels) if neighbor_labels else "—"
            })
        return adj_list

    def get_degrees_info(self):
        degree_list = []
        degrees_values = []
        for n_id, data in self.G.nodes(data=True):
            label = data.get('label', f"v{n_id}")
            if self.is_directed:
                in_deg, out_deg = self.G.in_degree(n_id), self.G.out_degree(n_id)
                degree_list.append({'label': label, 'in_degree': in_deg, 'out_degree': out_deg, 'total': in_deg + out_deg})
                degrees_values.append((in_deg, out_deg))
            else:
                deg = self.G.degree(n_id)
                degree_list.append({'label': label, 'degree': deg})
                degrees_values.append(deg)
        is_regular = all(d == degrees_values[0] for d in degrees_values) if degrees_values else False
        return degree_list, is_regular

    def get_connectivity_info(self):
        res = {'components_count': 0, 'vertex_connectivity': 0, 'edge_connectivity': 0}
        if not self.G.nodes: return res
        
        # Кількість компонент (для орієнтованих - слабка зв'язність)
        res['components_count'] = (
            nx.number_weakly_connected_components(self.G) 
            if self.is_directed else nx.number_connected_components(self.G)
        )
        
        try:
            # ВИПРАВЛЕНО: Розрахунок характеристик зв'язності
            
            # 1. Для вершинної зв'язності використовуємо ПРОСТИЙ граф (без петель і кратності)
            # Бо видалення вершини видаляє всі ребра, незалежно від їх кількості
            simple_ug = nx.Graph(self.G.to_undirected())
            simple_ug.remove_edges_from(nx.selfloop_edges(simple_ug))
            
            # 2. Для реберної зв'язності використовуємо МУЛЬТИГРАФ, але без петель
            multi_ug = self.G.to_undirected()
            multi_ug.remove_edges_from(nx.selfloop_edges(multi_ug))

            # Перевіряємо, чи граф зв'язний в принципі
            if nx.is_connected(simple_ug):
                # Вершинна зв'язність не може бути більшою за N-1
                res['vertex_connectivity'] = nx.node_connectivity(simple_ug)
                # Реберна зв'язність враховує кратні ребра
                res['edge_connectivity'] = nx.edge_connectivity(multi_ug)
            else:
                res['vertex_connectivity'] = 0
                res['edge_connectivity'] = 0
                
        except Exception as e:
            print(f"Connectivity calculation error: {e}")
            pass
            
        return res

    def get_all_properties(self):
        degrees, is_regular = self.get_degrees_info()
        return {
            'adjacency_matrix': self.get_adjacency_matrix(),
            'incidence_matrix': self.get_incidence_matrix(),
            'adjacency_list': self.get_adjacency_list(),
            'degrees': degrees,
            'is_regular': is_regular,
            'connectivity': self.get_connectivity_info(),
            'is_directed': self.is_directed
        }
import networkx as nx
import numpy as np

class GraphAnalyzer:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        self.G = nx.DiGraph() if is_directed else nx.Graph()

        for node in nodes:
            self.G.add_node(node['id'], label=node.get('label', f"v{node['id']}"))

        for edge in edges:
            self.G.add_edge(
                edge['from'], 
                edge['to'], 
                weight=float(edge.get('weight', 1))
            )

    def get_adjacency_matrix(self):
        if not self.G.nodes: return []
        matrix = nx.to_numpy_array(self.G, weight=None)
        return matrix.astype(int).tolist()

    def get_incidence_matrix(self):
        if not self.G.nodes or not self.G.edges: return []
        # todense() повертає матрицю, яку ми перетворюємо в чистий список
        matrix = nx.incidence_matrix(self.G, oriented=self.is_directed).todense()
        return np.array(matrix).astype(int).tolist()

    def get_degrees_info(self):
        degree_list = []
        degrees_values = []
        for n in self.G.nodes(data=True):
            # СПОЧАТКУ створюємо node_id
            node_id = n[0]
            # ПОТІМ використовуємо його для label
            label = n[1].get('label', f"v{node_id}")
            
            if self.is_directed:
                in_deg = self.G.in_degree(node_id)
                out_deg = self.G.out_degree(node_id)
                degree_list.append({
                    'label': label,
                    'in_degree': in_deg,
                    'out_degree': out_deg,
                    'total': in_deg + out_deg
                })
                degrees_values.append((in_deg, out_deg))
            else:
                deg = self.G.degree(node_id)
                degree_list.append({
                    'label': label,
                    'degree': deg
                })
                degrees_values.append(deg)

        is_regular = all(d == degrees_values[0] for d in degrees_values) if degrees_values else False
        return degree_list, is_regular

    def get_connectivity_info(self):
        res = {'components_count': 0, 'vertex_connectivity': 0, 'edge_connectivity': 0}
        if not self.G.nodes: return res
        res['components_count'] = nx.number_weakly_connected_components(self.G) if self.is_directed else nx.number_connected_components(self.G)
        try:
            ug = self.G.to_undirected()
            res['vertex_connectivity'] = nx.node_connectivity(ug)
            res['edge_connectivity'] = nx.edge_connectivity(ug)
        except: pass
        return res

    def get_all_properties(self):
        degrees, is_regular = self.get_degrees_info()
        return {
            'adjacency_matrix': self.get_adjacency_matrix(),
            'incidence_matrix': self.get_incidence_matrix(),
            'degrees': degrees,
            'is_regular': is_regular,
            'connectivity': self.get_connectivity_info(),
            'is_directed': self.is_directed
        }

# Додаємо цю функцію, щоб виправти помилку імпорту в views.py
def get_analyzer(nodes, edges, is_directed):
    return GraphAnalyzer(nodes, edges, is_directed)
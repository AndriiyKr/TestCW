import networkx as nx

class GraphTraverser:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        self.nodes_dict = {str(n['id']): n.get('label', f"v{n['id']}") for n in nodes}
        self.G = nx.MultiDiGraph() if is_directed else nx.MultiGraph()
        
        for node in nodes: 
            self.G.add_node(str(node['id']))
        
        for edge in edges: 
            self.G.add_edge(str(edge['from']), str(edge['to']), id=edge.get('id'))

    def run_dfs(self, start_node_id):
        """DFS з детальним протоколом та коректним бектрекінгом."""
        start_node_id = str(start_node_id)
        if start_node_id not in self.nodes_dict:
            return {"error": f"Вершину з ID {start_node_id} не знайдено"}

        protocol = []
        visited = set()
        stack = [start_node_id]
        tree_edges = []
        counter = 1
        
        # Початковий стан
        visited.add(start_node_id)
        protocol.append({
            "vertex": self.nodes_dict[start_node_id],
            "dfs_num": counter,
            "stack": [self.nodes_dict[n] for n in stack],
            "tree_edge": "—",
            "edge_id": None
        })

        while stack:
            u = stack[-1]
            unvisited_neighbor = None
            found_edge_id = None
            
            # Сортуємо сусідів для детермінованого обходу (напр. за лейблом або ID)
            neighbors = sorted(list(self.G.neighbors(u)), key=lambda x: self.nodes_dict.get(x, x))
            
            for v in neighbors:
                if v not in visited:
                    unvisited_neighbor = v
                    # Отримуємо ID першого ліпшого ребра між u та v
                    edge_data = self.G.get_edge_data(u, v)
                    key = list(edge_data.keys())[0]
                    found_edge_id = edge_data[key].get('id')
                    break
            
            if unvisited_neighbor:
                counter += 1
                v = unvisited_neighbor
                visited.add(v)
                stack.append(v)
                
                edge_label = f"({self.nodes_dict[u]}, {self.nodes_dict[v]})" if self.is_directed else f"{{{self.nodes_dict[u]}, {self.nodes_dict[v]}}}"
                tree_edges.append({"from": u, "to": v, "id": found_edge_id})

                protocol.append({
                    "vertex": self.nodes_dict[v],
                    "dfs_num": counter,
                    "stack": [self.nodes_dict[n] for n in stack],
                    "tree_edge": edge_label,
                    "edge_id": found_edge_id
                })
            else:
                # ВІДКАТ (Backtracking)
                stack.pop()
                if stack:
                    protocol.append({
                        "vertex": "—",
                        "dfs_num": "—",
                        "stack": [self.nodes_dict[n] for n in stack],
                        "tree_edge": "backtrack",
                        "edge_id": None
                    })
                else:
                    protocol.append({
                        "vertex": "—",
                        "dfs_num": "—",
                        "stack": "∅",
                        "tree_edge": "—",
                        "edge_id": None
                    })
        
        return {"protocol": protocol, "tree_edges": tree_edges}

    def run_bfs(self, start_node_id):
        """BFS з чергою та протоколом."""
        start_node_id = str(start_node_id)
        if start_node_id not in self.nodes_dict:
            return {"error": f"Вершину з ID {start_node_id} не знайдено"}

        protocol = []
        visited = {start_node_id}
        queue = [start_node_id]
        tree_edges = []
        counter = 1

        protocol.append({
            "vertex": self.nodes_dict[start_node_id],
            "bfs_num": counter,
            "queue": [self.nodes_dict[n] for n in queue],
            "tree_edge": "—",
            "edge_id": None
        })

        head_idx = 0
        while head_idx < len(queue):
            u = queue[head_idx]
            
            # Сортуємо для передбачуваності
            neighbors = sorted(list(self.G.neighbors(u)), key=lambda x: self.nodes_dict.get(x, x))
            
            for v in neighbors:
                if v not in visited:
                    counter += 1
                    visited.add(v)
                    queue.append(v)
                    
                    edge_data = self.G.get_edge_data(u, v)
                    key = list(edge_data.keys())[0]
                    found_edge_id = edge_data[key].get('id')
                    
                    edge_label = f"({self.nodes_dict[u]}, {self.nodes_dict[v]})" if self.is_directed else f"{{{self.nodes_dict[u]}, {self.nodes_dict[v]}}}"
                    tree_edges.append({"from": u, "to": v, "id": found_edge_id})

                    protocol.append({
                        "vertex": self.nodes_dict[v],
                        "bfs_num": counter,
                        "queue": [self.nodes_dict[n] for n in queue[head_idx:]], # Показуємо активну чергу
                        "tree_edge": edge_label,
                        "edge_id": found_edge_id
                    })
            
            head_idx += 1
            # Логуємо стан після видалення елемента з голови черги
            current_queue = [self.nodes_dict[n] for n in queue[head_idx:]]
            protocol.append({
                "vertex": "—",
                "bfs_num": "—",
                "queue": current_queue if current_queue else "∅",
                "tree_edge": "—",
                "edge_id": None
            })

        return {"protocol": protocol, "tree_edges": tree_edges}

# Глобальні функції виклику
def run_dfs(nodes, edges, is_directed, start_node):
    return GraphTraverser(nodes, edges, is_directed).run_dfs(start_node)

def run_bfs(nodes, edges, is_directed, start_node):
    return GraphTraverser(nodes, edges, is_directed).run_bfs(start_node)
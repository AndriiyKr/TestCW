import networkx as nx

class GraphTraverser:
    def __init__(self, nodes, edges, is_directed=False):
        self.is_directed = is_directed
        self.nodes_dict = {n['id']: n.get('label', f"v{n['id']}") for n in nodes}
        
        if is_directed:
            self.G = nx.MultiDiGraph()
        else:
            self.G = nx.MultiGraph()

        for node in nodes:
            self.G.add_node(node['id'])
        
        for edge in edges:
            # Зберігаємо edge_id, щоб фронтенд міг підсвітити конкретну лінію
            self.G.add_edge(edge['from'], edge['to'], id=edge.get('id'))

    def run_dfs(self, start_node_id):
        """
        DFS з детальним протоколом: Вершина, DFS-номер, Стек, Ребра дерева.
        """
        protocol = []
        visited = []
        stack = [start_node_id]
        dfs_numbers = {}
        tree_edges = []
        counter = 1

        # Початковий стан
        dfs_numbers[start_node_id] = counter
        visited.append(start_node_id)
        
        # Перший рядок протоколу
        protocol.append({
            "vertex": self.nodes_dict[start_node_id],
            "dfs_num": counter,
            "stack": [self.nodes_dict[n] for n in stack],
            "tree_edge": None,
            "edge_id": None
        })

        while stack:
            u = stack[-1]
            # Шукаємо сусіда, якого ще не відвідали
            unvisited_neighbor = None
            found_edge_id = None
            
            # Для MultiGraph neighbors повертає унікальні вузли
            for v in self.G.neighbors(u):
                if v not in visited:
                    unvisited_neighbor = v
                    # Беремо id першого-ліпшого ребра між ними (для дерева)
                    edge_data = self.G.get_edge_data(u, v)
                    # В MultiGraph edge_data - це словник {key: data}
                    key = list(edge_data.keys())[0]
                    found_edge_id = edge_data[key].get('id')
                    break
            
            if unvisited_neighbor is not None:
                counter += 1
                v = unvisited_neighbor
                visited.append(v)
                stack.append(v)
                dfs_numbers[v] = counter
                
                tree_edge_label = f"{{{self.nodes_dict[u]}, {self.nodes_dict[v]}}}"
                tree_edges.append({"from": u, "to": v, "id": found_edge_id})

                protocol.append({
                    "vertex": self.nodes_dict[v],
                    "dfs_num": counter,
                    "stack": [self.nodes_dict[n] for n in stack],
                    "tree_edge": tree_edge_label,
                    "edge_id": found_edge_id
                })
            else:
                # Backtracking (вертаємось назад)
                stack.pop()
                if stack:
                    protocol.append({
                        "vertex": "—",
                        "dfs_num": "—",
                        "stack": [self.nodes_dict[n] for n in stack],
                        "tree_edge": "—",
                        "edge_id": None
                    })
                else:
                    # Стек порожній - кінець
                    protocol.append({
                        "vertex": "—",
                        "dfs_num": "—",
                        "stack": "∅",
                        "tree_edge": "—",
                        "edge_id": None
                    })
        
        return {"protocol": protocol, "tree_edges": tree_edges}

    def run_bfs(self, start_node_id):
        """
        BFS з детальним протоколом: Вершина, BFS-номер, Черга, Ребра дерева.
        """
        protocol = []
        visited = [start_node_id]
        queue = [start_node_id]
        bfs_numbers = {start_node_id: 1}
        tree_edges = []
        counter = 1

        # Початковий стан
        protocol.append({
            "vertex": self.nodes_dict[start_node_id],
            "bfs_num": counter,
            "queue": [self.nodes_dict[n] for n in queue],
            "tree_edge": None,
            "edge_id": None
        })

        # В BFS ми обробляємо вершини в порядку черги
        head_index = 0
        while head_index < len(visited):
            u = visited[head_index]
            
            # Шукаємо всіх невідвіданих сусідів поточної вершини u
            for v in self.G.neighbors(u):
                if v not in visited:
                    counter += 1
                    visited.append(v)
                    queue.append(v)
                    bfs_numbers[v] = counter
                    
                    edge_data = self.G.get_edge_data(u, v)
                    key = list(edge_data.keys())[0]
                    found_edge_id = edge_data[key].get('id')
                    
                    tree_edge_label = f"{{{self.nodes_dict[u]}, {self.nodes_dict[v]}}}"
                    tree_edges.append({"from": u, "to": v, "id": found_edge_id})

                    protocol.append({
                        "vertex": self.nodes_dict[v],
                        "bfs_num": counter,
                        "queue": [self.nodes_dict[n] for n in queue],
                        "tree_edge": tree_edge_label,
                        "edge_id": found_edge_id
                    })
            
            # Видаляємо u з віртуальної черги (для протоколу)
            queue.pop(0)
            head_index += 1
            
            if queue:
                protocol.append({
                    "vertex": "—",
                    "bfs_num": "—",
                    "queue": [self.nodes_dict[n] for n in queue],
                    "tree_edge": "—",
                    "edge_id": None
                })
            else:
                protocol.append({
                    "vertex": "—",
                    "bfs_num": "—",
                    "queue": "∅",
                    "tree_edge": "—",
                    "edge_id": None
                })

        return {"protocol": protocol, "tree_edges": tree_edges}
    
def run_dfs(nodes, edges, is_directed, start_node):
    traverser = GraphTraverser(nodes, edges, is_directed)
    return traverser.run_dfs(start_node)

def run_bfs(nodes, edges, is_directed, start_node):
    traverser = GraphTraverser(nodes, edges, is_directed)
    return traverser.run_bfs(start_node)
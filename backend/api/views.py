from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import networkx as nx
from .logic.graph_engine import GraphAnalyzer
# Підключаємо твої файли
from .logic import solvers, pathfinding, traversals

class AnalyzeGraphView(APIView):
    def post(self, request):
        try:
            analyzer = GraphAnalyzer(
                request.data.get('nodes', []), 
                request.data.get('edges', []), 
                request.data.get('is_directed', False)
            )
            return Response(analyzer.get_all_properties())
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SolveGraphView(APIView):
    def post(self, request):
        try:
            data = request.data
            analyzer = GraphAnalyzer(data['nodes'], data['edges'], data.get('is_directed', False))
            G = analyzer.G
            
            # ВИКЛИК ТВОЇХ АЛГОРИТМІВ
            euler_res = solvers.check_eulerian(G, data.get('is_directed', False))
            hamilton_res = solvers.find_hamiltonian(G)
            
            # Клікове число (тільки для неорієнтованих)
            undirected_G = G.to_undirected()
            try:
                clique_num = nx.graph_clique_number(undirected_G)
            except:
                from networkx.algorithms import approximation
                clique_num = len(approximation.max_clique(undirected_G))

            return Response({
                "euler": euler_res,
                "hamilton": hamilton_res,
                "invariants": {
                    "clique_number": clique_num,
                    "chromatic_number": max(nx.coloring.greedy_color(undirected_G).values(), default=-1) + 1
                }
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class DijkstraView(APIView):
    def post(self, request):
        try:
            data = request.data
            analyzer = GraphAnalyzer(data['nodes'], data['edges'], data.get('is_directed', False))
            # Використовуємо твій pathfinding.py
            result = pathfinding.run_dijkstra(analyzer.G, data['start_node'], data['end_node'])
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class TraverseView(APIView):
    """Обхід графа (DFS/BFS) через твій traversals.py"""
    def post(self, request, type):
        try:
            data = request.data
            analyzer = GraphAnalyzer(data['nodes'], data['edges'], data.get('is_directed', False))
            
            if type == 'dfs':
                result = traversals.run_dfs(analyzer.G, data['start_node'])
            else:
                result = traversals.run_bfs(analyzer.G, data['start_node'])
                
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
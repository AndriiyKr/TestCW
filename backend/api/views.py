from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import networkx as nx
from .logic.graph_engine import GraphAnalyzer
from .logic.solvers import GraphSolvers
from .logic import pathfinding, traversals

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
            # Створюємо екземпляр класу GraphSolvers
            solver = GraphSolvers(
                request.data.get('nodes', []),
                request.data.get('edges', []),
                request.data.get('is_directed', False)
            )
            # Викликаємо метод отримання всіх розв'язків
            return Response(solver.get_all_solutions())
        except Exception as e:
            # Виводимо помилку в консоль сервера для діагностики
            import traceback
            print(f"DEBUG: Error in SolveGraphView: {str(e)}")
            traceback.print_exc()
            return Response({"error": str(e)}, status=400)

class DijkstraView(APIView):
    def post(self, request):
        data = request.data
        # Виклик має бути чітким:
        result = pathfinding.run_dijkstra(
            data['nodes'], 
            data['edges'], 
            data.get('is_directed', False),
            data['start_node'], # Це має бути ID (число або рядок)
            data['end_node']    # Це має бути ID
        )
        return Response(result)
    
class FloydView(APIView):
    def post(self, request):
        data = request.data
        # Отримуємо прапорець орієнтованості (перевіряємо обидва варіанти назви)
        is_directed = data.get('is_directed', data.get('isDirected', False))
        
        result = pathfinding.run_floyd(
            data['nodes'], 
            data['edges'], 
            is_directed
        )
        return Response(result)

class TraverseView(APIView):
    """Обхід графа (DFS/BFS) з детальним протоколом"""
    def post(self, request, type):
        try:
            data = request.data
            nodes = data.get('nodes', [])
            edges = data.get('edges', [])
            is_directed = data.get('is_directed', False)
            start_node = data.get('start_node')

            if type == 'dfs':
                result = traversals.run_dfs(nodes, edges, is_directed, start_node)
            else:
                result = traversals.run_bfs(nodes, edges, is_directed, start_node)
                
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
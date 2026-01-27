from django.urls import path
from .views import (
    AnalyzeGraphView, 
    SolveGraphView, 
    DijkstraView, 
    TraverseView
)

urlpatterns = [
    path('analyze/', AnalyzeGraphView.as_view()),
    path('solve/', SolveGraphView.as_view()),
    path('dijkstra/', DijkstraView.as_view()),
    path('traverse/<str:type>/', TraverseView.as_view()), # Універсальний шлях для DFS/BFS
]
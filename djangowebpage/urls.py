from app import views
from django.urls import path

urlpatterns = [
    path('', views.index, name='index'),
    path('get_market_coins', views.get_market_coins, name='get_market_coins'),
    path('get_market_chart/', views.get_market_chart, name='get_market_chart'),
]

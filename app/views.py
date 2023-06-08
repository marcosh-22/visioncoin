from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from .utils.Coingecko import CoingeckoAPI

def index(request):
    return render(request, "index.html")

def get_market_coins(request):
    market_data = CoingeckoAPI.get_market_coins()
    return JsonResponse({"data": market_data.json()}, status=market_data.status_code)
    
def get_market_chart(request):
    COINID = request.GET.get("coinid")
    DAYS = request.GET.get("days", '1')

    if not COINID or not DAYS:
        return JsonResponse({"error": "Missing parameters"}, status=400)
    if not (DAYS == '1' or DAYS == '7' or DAYS == '30'):
        return JsonResponse({"error": "Invalid days"}, status=400)

    market_chart = CoingeckoAPI.get_market_chart(COINID, DAYS)

    return JsonResponse({"data": market_chart.json()}, status=market_chart.status_code)

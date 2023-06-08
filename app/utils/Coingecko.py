from .URLCache import URLCache

MAX_MARKET_COINS_LIMIT = 100
class CoingeckoAPI:
    base_url = "https://api.coingecko.com/api/v3"
    cache = URLCache()

    @staticmethod
    def get_market_coins():
        url = f"{CoingeckoAPI.base_url}/coins/markets?vs_currency=usd&sparkline=false"
        response = CoingeckoAPI.cache.make_request(url)
        return response

    @staticmethod
    def get_market_chart(coin_id, days=1):
        url = f"{CoingeckoAPI.base_url}/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
        response = CoingeckoAPI.cache.make_request(url)
        return response

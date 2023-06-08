import requests
import time

class URLCache:
    def __init__(self, cache_timeout=60, request_timeout=10):
        self.cache = {}
        self.cache_timeout = cache_timeout
        self.request_timeout = request_timeout
        self.in_progress = {}

    def make_request(self, url, method="GET", data=None):
        if (url in self.cache and time.time() - self.cache[url]["timestamp"] < self.cache_timeout):
            print(f"url in cache: {url}")
            return self.cache[url]["response"]

        if url in self.in_progress and self.in_progress[url]:
            print(f"url already in progress: {url}")
            timeout = self.request_timeout
            start_time = time.time()
            while self.in_progress[url]:
                if time.time() - start_time > timeout:
                    print(f"url timeout: {url}")
                    break
                time.sleep(0.1)

            if url in self.cache:
                return self.cache[url]["response"]

        self.in_progress[url] = True
        response = self._fetch_data(url, method, data)
        self.in_progress[url] = False

        if response:
            self.cache[url] = {"response": response, "timestamp": time.time()}

        return response

    def _fetch_data(self, url, method, data):
        try:
            response = requests.request(
                method, url, data=data, timeout=self.request_timeout
            )
        except:
            response = None

        return response

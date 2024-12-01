from typing import Any, Optional
from datetime import datetime, timedelta
import json


class CacheService:
    def __init__(self):
        self._cache = {}
        self._timestamps = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp = self._timestamps.get(key)
            if timestamp and datetime.now() < timestamp:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._timestamps[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 3600):
        self._cache[key] = value
        self._timestamps[key] = datetime.now() + timedelta(seconds=ttl_seconds)

    def clear(self):
        self._cache.clear()
        self._timestamps.clear()


cache_service = CacheService()
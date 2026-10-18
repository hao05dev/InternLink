"""Small server-side HTTP client used by the Streamlit workbench."""
from dataclasses import dataclass
import time

import httpx


class AiServiceError(RuntimeError):
    def __init__(self, status_code: int | None, detail: object):
        self.status_code = status_code
        self.detail = detail
        super().__init__(str(detail))


@dataclass(frozen=True)
class ApiResult:
    data: dict
    status_code: int
    elapsed_ms: float


class AiServiceClient:
    def __init__(self, base_url: str, api_key: str = "", timeout: float = 65):
        self.base_url = base_url.rstrip("/")
        self.headers = {"X-InternLink-AI-Key": api_key} if api_key else {}
        self.timeout = timeout

    def get(self, path: str) -> ApiResult:
        return self._request("GET", path)

    def post(self, path: str, payload: dict) -> ApiResult:
        return self._request("POST", path, payload)

    def _request(self, method: str, path: str, payload: dict | None = None) -> ApiResult:
        started = time.perf_counter()
        try:
            response = httpx.request(
                method, self.base_url + path, json=payload, headers=self.headers, timeout=self.timeout,
            )
        except httpx.RequestError as error:
            raise AiServiceError(None, f"Không kết nối được AI service: {error}") from None
        elapsed = round((time.perf_counter() - started) * 1000, 1)
        try:
            body = response.json()
        except ValueError:
            body = {"detail": "AI service trả dữ liệu không phải JSON"}
        if response.is_error:
            raise AiServiceError(response.status_code, body.get("detail", body))
        return ApiResult(body, response.status_code, elapsed)

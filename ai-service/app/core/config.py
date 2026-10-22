from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICE_ROOT / ".env", extra="ignore")

    APP_NAME: str = "InternLink AI Service"
    PORT: int = Field(default=8001, ge=1, le=65535)
    EXTRACTION_PROVIDER: Literal["rules", "gemini"] = "rules"
    # Lexical hashing baselines are excluded from online inference because they
    # are not multilingual semantic embedding models.
    EMBEDDING_PROVIDER: Literal["disabled", "gemini", "local_e5"] = "disabled"
    MATCHING_ALGORITHM: Literal["heuristic"] = "heuristic"
    SERVICE_API_KEY: SecretStr = SecretStr("")
    LOCAL_MODEL_PATH: str = ""
    LOCAL_MODEL_REVISION: str = ""
    GEMINI_API_KEY: SecretStr = SecretStr("")
    # Select supported model IDs explicitly at deployment time.
    LLM_MODEL: str = ""
    EMBEDDING_MODEL: str = ""
    EMBEDDING_MODEL_REVISION: str = ""
    EMBEDDING_DIMENSION: int = Field(default=768, ge=1, le=4096)
    PROVIDER_TIMEOUT_SECONDS: float = Field(default=8, gt=0, le=60)
    ENABLE_SAMPLE_BENCHMARK: bool = False
    CORS_ORIGINS: list[str] = Field(default_factory=list)
    TAXONOMY_PATH: Path = SERVICE_ROOT / "app/data/esco_it_skills.json"
    TAXONOMY_VERSION: str = "internlink-it-v2"

    @model_validator(mode="after")
    def check_provider_configuration(self):
        enabled = self.EXTRACTION_PROVIDER == "gemini" or self.EMBEDDING_PROVIDER == "gemini"
        key = self.GEMINI_API_KEY.get_secret_value().strip()
        if enabled and (not key or key == "your_gemini_api_key_here"):
            raise ValueError("Gemini providers require a real GEMINI_API_KEY")
        if self.EXTRACTION_PROVIDER == "gemini" and not self.LLM_MODEL.strip():
            raise ValueError("Set LLM_MODEL explicitly when enabling Gemini extraction")
        if self.EMBEDDING_PROVIDER == "gemini" and not self.EMBEDDING_MODEL.strip():
            raise ValueError("Set EMBEDDING_MODEL explicitly when enabling Gemini embeddings")
        if self.EMBEDDING_PROVIDER == "gemini" and not self.EMBEDDING_MODEL_REVISION.strip():
            raise ValueError("Set EMBEDDING_MODEL_REVISION explicitly when enabling Gemini embeddings")
        if self.EMBEDDING_PROVIDER == "local_e5" and (not self.LOCAL_MODEL_PATH or not self.LOCAL_MODEL_REVISION):
            raise ValueError("Local E5 requires LOCAL_MODEL_PATH and LOCAL_MODEL_REVISION")
        return self

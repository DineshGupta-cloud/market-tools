from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Market Tools API"
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"
    log_level: str = "INFO"
    request_timeout_seconds: float = 10.0
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

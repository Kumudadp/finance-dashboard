from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = 'Finance Dashboard API'
    DEBUG: bool = False
    SECRET_KEY: str = 'change-this'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = ''

    class Config:
        env_file = '.env'


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

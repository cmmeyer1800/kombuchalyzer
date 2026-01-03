"""Postgres database connection utilities."""
from collections.abc import Generator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from kbalyzer.settings import settings

Base = declarative_base()

engine = create_async_engine(settings.postgres_uri, echo=settings.ENV == "dev") # echo=True for logging SQL queries
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def get_db() -> Generator[AsyncSession]:
    """Get a database session from the local connection pool."""
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()

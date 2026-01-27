from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from contextlib import asynccontextmanager

# Get DB URL from env or fallback to localhost for dev
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://velox:veloxpass@localhost:5432/velox_orchestrator")

engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Log SQL for debugging (disable in prod)
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

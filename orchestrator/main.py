from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import logging
from config import settings

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("velox-orchestrator")

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from contextlib import asynccontextmanager
from database import init_db

@app.on_event("startup")
async def on_startup():
    await init_db()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import scans, targets
app.include_router(scans.router, prefix=settings.API_V1_STR, tags=["scans"])
app.include_router(targets.router, prefix=settings.API_V1_STR, tags=["targets"])

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

@app.get("/health")
async def health_check():
    """
    Health Check Endpoint
    Verifies that the service and its dependencies (Redis) are reachable.
    """
    try:
        # TODO: Add Redis Ping here
        return {"status": "healthy", "service": settings.APP_NAME}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service Unhealthy")

@app.get("/")
async def root():
    return {"message": "Velox Orchestrator Service is Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

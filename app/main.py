from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    description='Finance Dashboard Backend API',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={'detail': 'An unexpected error occurred.'},
    )


app.include_router(api_router)


@app.get('/', tags=['Health'])
def health_check():
    return {
        'status': 'ok',
        'app': settings.APP_NAME,
        'version': '1.0.0',
    }
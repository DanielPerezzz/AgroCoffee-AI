from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgroCoffee AI API",
    description="API para el monitoreo inteligente del secado de café",
    version="0.1.0",
)

# Configuración provisional para desarrollo.
# Se restringirá antes de una implementación de producción.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a la API de AgroCoffee AI",
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "agrocoffee-api",
        "version": "0.1.0",
    }
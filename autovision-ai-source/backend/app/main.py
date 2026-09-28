from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import MAX_IMAGE_BYTES
from app.schemas.analysis import AnalysisResponse, ModelStatus
from app.services.pipeline import VehiclePipeline

app = FastAPI(
    title="AutoVision AI Backend",
    version="0.1.0",
    description="Vehicle detection, make/model classification, and exterior colour estimation.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

pipeline = VehiclePipeline()


@app.get("/api/v1/health", response_model=ModelStatus)
def health() -> ModelStatus:
    return ModelStatus(**pipeline.status)


@app.get("/api/v1/models", response_model=ModelStatus)
def models() -> ModelStatus:
    return ModelStatus(**pipeline.status)


@app.post("/api/v1/analyze", response_model=AnalysisResponse)
async def analyze(image: UploadFile = File(...)) -> AnalysisResponse:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Use a JPEG, PNG, or WebP image.")

    payload = await image.read()
    if len(payload) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 10 MB upload limit.")

    try:
        return AnalysisResponse(**pipeline.analyze(payload))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The image could not be decoded.") from exc
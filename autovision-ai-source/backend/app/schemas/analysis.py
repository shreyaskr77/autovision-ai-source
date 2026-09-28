from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(ge=0, le=1)
    height: float = Field(ge=0, le=1)


class VehicleAnalysis(BaseModel):
    vehicle_id: str
    bounding_box: BoundingBox
    detection_confidence: float = Field(ge=0, le=1)
    make: str
    model: str
    classification_confidence: float = Field(ge=0, le=1)
    colour: str
    colour_hex: str
    status: str


class AnalysisResponse(BaseModel):
    success: bool
    vehicles: list[VehicleAnalysis]
    annotated_image: str | None = None
    processing_time_ms: int
    error: str | None = None


class ModelStatus(BaseModel):
    detector: str
    classifier: str
    colour_estimator: str
    ready: bool
    message: str
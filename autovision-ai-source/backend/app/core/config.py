import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))
DETECTOR_MODEL_PATH = Path(
    os.getenv("DETECTOR_MODEL_PATH", MODELS_DIR / "yolo-vehicle.pt")
)
CLASSIFIER_MODEL_PATH = Path(
    os.getenv("CLASSIFIER_MODEL_PATH", MODELS_DIR / "vehicle-classifier.pt")
)
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(10 * 1024 * 1024)))
MAX_IMAGE_DIMENSION = int(os.getenv("MAX_IMAGE_DIMENSION", "1600"))